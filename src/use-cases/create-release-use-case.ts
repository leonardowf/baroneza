import { Observable, of, zip } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo, flatMap } from 'rxjs/operators';
import { PullRequestCreator } from '../workers/pull-request-creator';
import { TagUseCase, TagUseCaseInput } from './tag-use-case';
import {
  CreateChangelogUseCase,
  CreateChangelogInput
} from './create-changelog-use-case';
import { ReleasePageCreator } from '../workers/release-page-creator';
import { PullRequestDescriptionWriter } from '../workers/pull-request-description-writer';
import { KnownMessageType, MessageSender } from '../workers/message-sender';
import {
  CreateMilestoneUseCase,
  CreateMilestoneUseCaseInput
} from './create-milestone-use-case';

export class CreateReleaseUseCaseInput {
  branchName: string;
  referenceBranch: string;
  targetBranch: string;
  title: string;
  projectTag: string; // this is the tag, better naming please, example 1.0.0
  projectKeys: string[];
  repository: string;
  channel: string;
  jiraTagSuffix: string;

  constructor(
    branchName: string,
    referenceBranch: string,
    targetBranch: string,
    title: string,
    projectTag: string,
    projectKeys: string[],
    repository: string,
    channel: string,
    jiraTagSuffix: string
  ) {
    this.branchName = branchName;
    this.referenceBranch = referenceBranch;
    this.targetBranch = targetBranch;
    this.title = title;
    this.projectTag = projectTag;
    this.projectKeys = projectKeys;
    this.repository = repository;
    this.channel = channel;
    this.jiraTagSuffix = jiraTagSuffix;
  }
}

export class CreateReleaseUseCaseOutput {}

export class CreateReleaseUseCase {
  private readonly createBranchUseCase: CreateBranchUseCase;
  private readonly pullRequestCreator: PullRequestCreator;
  private readonly tagUseCase: TagUseCase;
  private readonly createChangelogUseCase: CreateChangelogUseCase;
  private readonly releasePageCreator: ReleasePageCreator;
  private readonly pullRequestDescriptionWriter: PullRequestDescriptionWriter;
  private readonly messageSender: MessageSender<KnownMessageType>;
  private readonly createMilestoneUseCase: CreateMilestoneUseCase;

  constructor(
    createBranchUseCase: CreateBranchUseCase,
    pullRequestCreator: PullRequestCreator,
    tagUseCase: TagUseCase,
    createChangelogUseCase: CreateChangelogUseCase,
    releasePageCreator: ReleasePageCreator,
    pullRequestDescriptionWriter: PullRequestDescriptionWriter,
    messageSender: MessageSender<KnownMessageType>,
    createMilestoneUseCase: CreateMilestoneUseCase
  ) {
    this.createBranchUseCase = createBranchUseCase;
    this.pullRequestCreator = pullRequestCreator;
    this.tagUseCase = tagUseCase;
    this.createChangelogUseCase = createChangelogUseCase;
    this.releasePageCreator = releasePageCreator;
    this.pullRequestDescriptionWriter = pullRequestDescriptionWriter;
    this.messageSender = messageSender;
    this.createMilestoneUseCase = createMilestoneUseCase;
  }

  execute(
    input: CreateReleaseUseCaseInput
  ): Observable<CreateReleaseUseCaseOutput> {
    return this.createBranchUseCase
      .execute(
        new CreateBranchUseCaseInput(
          input.branchName,
          input.referenceBranch,
          input.repository
        )
      )
      .pipe(
        flatMap(() =>
          this.pullRequestCreator.create(
            input.title,
            input.branchName,
            input.targetBranch,
            input.repository
          )
        )
      )
      .pipe(
        flatMap((x) =>
          zip(
            this.createMilestoneUseCase.execute(
              new CreateMilestoneUseCaseInput(
                x.pullRequestNumber,
                input.repository,
                input.projectTag
              )
            ),
            this.tagUseCase.execute(
              new TagUseCaseInput(
                x.pullRequestNumber,
                input.projectTag,
                input.projectKeys,
                input.repository,
                input.jiraTagSuffix
              )
            )
          ).pipe(
            flatMap(() => {
              return this.createChangelogUseCase
                .execute(
                  new CreateChangelogInput(
                    { type: 'pullRequestNumber', number: x.pullRequestNumber },
                    input.repository,
                    input.projectTag
                  )
                )
                .pipe(
                  flatMap((changelog) => {
                    let writeOnPR: Observable<void> = of(void 0);
                    let messageSender: Observable<void> = of(void 0);
                    if (changelog !== undefined) {
                      writeOnPR = this.pullRequestDescriptionWriter.write(
                        x.pullRequestNumber,
                        input.repository,
                        changelog.markdown.content
                      );

                      messageSender = this.messageSender
                        .send({
                          destination: input.channel,
                          content: changelog.blocks.content
                        })
                        .pipe(mapTo(void 0));
                    }

                    return zip(
                      this.releasePageCreator.create(
                        input.projectTag,
                        input.projectTag,
                        input.repository,
                        changelog?.markdown.content
                      ),
                      writeOnPR,
                      messageSender
                    );
                  })
                );
            })
          )
        )
      )
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
