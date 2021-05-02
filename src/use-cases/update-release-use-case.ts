import { forkJoin, Observable, of, zip } from 'rxjs';
import { catchError, flatMap, map, mapTo } from 'rxjs/operators';
import { GithubService } from '../services/github-service';
import { JiraService } from '../services/jira-service';
import { SlackMessageSender } from '../workers/message-sender';
import {
  CreateChangelogOutput,
  CreateChangelogUseCase
} from './create-changelog-use-case';
import {
  CreateMilestoneUseCase,
  CreateMilestoneUseCaseInput
} from './create-milestone-use-case';
import {
  ExtractTicketsUseCase,
  TicketIdCommit
} from './extract-tickets-use-case';
import { TagUseCase, TagUseCaseInput } from './tag-use-case';

export type UpdateReleaseInput = {
  readonly channel: string;
  readonly fromVersion: string;
  readonly jiraSuffix: string;
  readonly project: string;
  readonly pullRequestNumber: number;
  readonly repository: string;
  readonly title: string;
  readonly toVersion: string;
};

export type UpdateReleaseOutput = {};

export interface UpdateReleaseUseCase {
  execute(input: UpdateReleaseInput): Observable<UpdateReleaseOutput>;
}

export interface ConcreteUpdateReleaseUseCaseDependencies {
  createChangelogUseCase: CreateChangelogUseCase;
  createMilestoneUseCase: CreateMilestoneUseCase;
  extractTicketsUseCase: ExtractTicketsUseCase;
  githubService: GithubService;
  jiraService: JiraService;
  owner: string;
  slackMessageSender: SlackMessageSender;
  tagUseCase: TagUseCase;
}
export class ConcreteUpdateReleaseUseCase implements UpdateReleaseUseCase {
  private readonly createChangelogUseCase: CreateChangelogUseCase;
  private readonly createMilestoneUseCase: CreateMilestoneUseCase;
  private readonly extractTicketsUseCase: ExtractTicketsUseCase;
  private readonly githubService: GithubService;
  private readonly jiraService: JiraService;
  private readonly owner: string;
  private readonly slackMessageSender: SlackMessageSender;
  private readonly tagUseCase: TagUseCase;

  constructor(dependencies: ConcreteUpdateReleaseUseCaseDependencies) {
    this.createChangelogUseCase = dependencies.createChangelogUseCase;
    this.createMilestoneUseCase = dependencies.createMilestoneUseCase;
    this.extractTicketsUseCase = dependencies.extractTicketsUseCase;
    this.githubService = dependencies.githubService;
    this.jiraService = dependencies.jiraService;
    this.owner = dependencies.owner;
    this.slackMessageSender = dependencies.slackMessageSender;
    this.tagUseCase = dependencies.tagUseCase;
  }

  execute(input: UpdateReleaseInput): Observable<UpdateReleaseOutput> {
    return this.extractTicketsUseCase
      .execute({
        pullRequestNumber: input.pullRequestNumber,
        repository: input.repository
      })
      .pipe(
        flatMap((extractTicketsOutput) =>
          this.categorizeTicketIds(extractTicketsOutput.ticketIdsCommits)
        ),
        flatMap((ticketsFixVersionData) =>
          this.changelog(
            ticketsFixVersionData,
            input.repository,
            input.toVersion
          )
        ),
        flatMap((createChangelogOutput) =>
          this.notifyChangelog(createChangelogOutput, input.channel)
        ),
        flatMap(() =>
          zip(
            this.updateJiraRelease(
              input.fromVersion,
              input.toVersion,
              input.jiraSuffix,
              input.project
            ),
            this.updateMilestone(
              input.fromVersion,
              input.toVersion,
              input.repository
            ),
            this.updateTitleOfPr(
              input.pullRequestNumber,
              input.repository,
              input.title
            )
          )
        ),
        flatMap(() =>
          zip(
            this.tagTickets(
              input.pullRequestNumber,
              input.toVersion,
              input.jiraSuffix,
              input.project,
              input.repository
            ),
            this.setMilestoneToPrs(
              input.pullRequestNumber,
              input.toVersion,
              input.repository
            )
          )
        ),
        flatMap(() =>
          this.buildChangelog(
            input.pullRequestNumber,
            input.repository,
            input.toVersion
          )
        ),
        flatMap((createChangelogOutput) =>
          createChangelogOutput
            ? zip(
                this.updateDescriptionOfPr(
                  createChangelogOutput,
                  input.pullRequestNumber,
                  input.repository
                ),
                this.updateRelease(
                  createChangelogOutput,
                  input.fromVersion,
                  input.toVersion,
                  input.repository
                )
              )
            : of(void 0)
        ),
        mapTo({})
      );
  }

  private changelog(
    ticketsFixVersionData: TicketFixVersionData[],
    repository: string,
    version: string
  ): Observable<CreateChangelogOutput | undefined> {
    const absentFixVersionTickets = ticketsFixVersionData.filter(
      (ticket) => ticket.fixVersionStatus === 'ABSENT'
    );
    if (absentFixVersionTickets.length === 0) {
      return of(undefined);
    }
    const changelog = this.createChangelogUseCase.execute({
      origin: {
        type: 'commits',
        commits: absentFixVersionTickets.map((ticket) => ticket.commit)
      },
      repository: repository,
      version: version
    });
    return changelog;
  }

  private categorizeTicketIds(
    ticketIdCommits: TicketIdCommit[]
  ): Observable<TicketFixVersionData[]> {
    if (ticketIdCommits.length === 0) {
      return of([]);
    }

    const streams = ticketIdCommits.map((ticketIdCommit) => {
      return this.jiraService.hasFixVersion(ticketIdCommit.ticketId).pipe(
        map(
          (hasFixVersion): TicketFixVersionData => {
            return hasFixVersion
              ? { ...ticketIdCommit, fixVersionStatus: 'PRESENT' }
              : { ...ticketIdCommit, fixVersionStatus: 'ABSENT' };
          }
        ),
        catchError(
          (): Observable<TicketFixVersionData> =>
            of({ ...ticketIdCommit, fixVersionStatus: 'UNKNOWN' })
        )
      );
    });

    return forkJoin(streams);
  }

  private notifyChangelog(
    createChangelogOutput: CreateChangelogOutput | undefined,
    channel: string
  ): Observable<void> {
    if (createChangelogOutput) {
      return this.slackMessageSender
        .send({
          destination: channel,
          content: createChangelogOutput.blocks.content
        })
        .pipe(mapTo(void 0));
    }
    return of(void 0);
  }

  private updateJiraRelease(
    fromVersion: string,
    toVersion: string,
    jiraSuffix: string,
    project: string
  ): Observable<void> {
    return this.jiraService.updateFixVersion(
      `${fromVersion}${jiraSuffix}`,
      `${toVersion}${jiraSuffix}`,
      project
    );
  }

  private updateMilestone(
    fromVersion: string,
    toVersion: string,
    repository: string
  ): Observable<void> {
    return this.githubService.updateMilestone(
      fromVersion,
      toVersion,
      this.owner,
      repository
    );
  }

  private buildChangelog(
    pullRequestNumber: number,
    repository: string,
    version: string
  ): Observable<CreateChangelogOutput | undefined> {
    return this.createChangelogUseCase.execute({
      origin: { type: 'pullRequestNumber', number: pullRequestNumber },
      repository,
      version
    });
  }

  private updateDescriptionOfPr(
    createChangelogOutput: CreateChangelogOutput,
    pullRequestNumber: number,
    repository: string
  ): Observable<void> {
    return this.githubService.updateDescription(
      pullRequestNumber,
      this.owner,
      repository,
      createChangelogOutput.markdown.content
    );
  }

  private updateTitleOfPr(
    pullRequestNumber: number,
    repository: string,
    title: string
  ): Observable<void> {
    return this.githubService.updateTitle(
      pullRequestNumber,
      title,
      this.owner,
      repository
    );
  }

  private updateRelease(
    createChangelogOutput: CreateChangelogOutput,
    fromVersion: string,
    toVersion: string,
    repository: string
  ): Observable<void> {
    return this.githubService.updateRelease(
      fromVersion,
      toVersion,
      createChangelogOutput.markdown.content,
      this.owner,
      repository
    );
  }

  private tagTickets(
    pullRequestNumber: number,
    toVersion: string,
    jiraSuffix: string,
    project: string,
    repository: string
  ): Observable<void> {
    return this.tagUseCase
      .execute(
        new TagUseCaseInput(
          pullRequestNumber,
          toVersion,
          project,
          repository,
          jiraSuffix
        )
      )
      .pipe(mapTo(void 0));
  }

  private setMilestoneToPrs(
    pullRequestNumber: number,
    version: string,
    repository: string
  ): Observable<void> {
    return this.createMilestoneUseCase
      .execute(
        new CreateMilestoneUseCaseInput(pullRequestNumber, repository, version)
      )
      .pipe(mapTo(void 0));
  }
}

type FixVersionStatus = 'PRESENT' | 'ABSENT' | 'UNKNOWN';
type TicketFixVersionData = {
  readonly ticketId: string;
  readonly commit: string;
  readonly fixVersionStatus: FixVersionStatus;
};
