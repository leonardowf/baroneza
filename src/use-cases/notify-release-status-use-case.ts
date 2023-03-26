import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Issue } from '../services/jira-service';
import { ShaWindow } from '../shared/sha-window';
import { IssuesOrganizer } from '../workers/issues-organizer';
import { IssuesReader } from '../workers/issues-reader';
import { IssuesStatusMessageBuilder } from '../workers/issues-status-message-builder';
import { MessageSender } from '../workers/message-sender';
import { ExtractTicketsUseCase } from './extract-tickets-use-case';

export type NotifyReleaseStatusUseCaseInput = {
  readonly reference: number | ShaWindow;
  readonly statuses: string[];
  readonly channel: string;
  readonly repository: string;
  readonly projectKeys: string[];
};

export type NotifyReleaseStatusUseCaseOutput = {};

export interface NotifyReleaseStatusUseCase {
  execute(
    input: NotifyReleaseStatusUseCaseInput
  ): Observable<NotifyReleaseStatusUseCaseOutput>;
}

export class ConcreteNotifyReleaseStatusUseCase
  implements NotifyReleaseStatusUseCase {
  readonly extractTicketsUseCase: ExtractTicketsUseCase;
  readonly issuesReader: IssuesReader;
  readonly issuesOrganizer: IssuesOrganizer;
  readonly issuesStatusMessageBuilder: IssuesStatusMessageBuilder;
  readonly messageSender: MessageSender<string>;

  constructor(
    extractTicketsUseCase: ExtractTicketsUseCase,
    issuesReader: IssuesReader,
    issuesOrganizer: IssuesOrganizer,
    issuesStatusMessageBuilder: IssuesStatusMessageBuilder,
    messageSender: MessageSender<string>
  ) {
    this.extractTicketsUseCase = extractTicketsUseCase;
    this.issuesReader = issuesReader;
    this.issuesOrganizer = issuesOrganizer;
    this.issuesStatusMessageBuilder = issuesStatusMessageBuilder;
    this.messageSender = messageSender;
  }

  execute(
    input: NotifyReleaseStatusUseCaseInput
  ): Observable<NotifyReleaseStatusUseCaseOutput> {
    return this.extractTicketsAndReadIssues(
      input.repository,
      input.reference
    ).pipe(
      map((issues) => {
        return this.issuesOrganizer.organize(
          issues,
          input.statuses,
          input.projectKeys
        );
      }),
      map((issuesPerProjectKeyAndStatus) =>
        this.issuesStatusMessageBuilder.buildMessage(
          issuesPerProjectKeyAndStatus
        )
      ),
      concatMap((message) => {
        return this.messageSender.send({
          destination: input.channel,
          content: message
        });
      })
    );
  }

  private extractTicketsAndReadIssues(
    repository: string,
    reference: number | ShaWindow
  ): Observable<Issue[]> {
    return this.extractTicketsUseCase.execute({ repository, reference }).pipe(
      concatMap((extractTicketsUseCaseOutput) => {
        const ticketIds = extractTicketsUseCaseOutput.ticketIdsCommits.map(
          (ticketIdCommit) => ticketIdCommit.ticketId
        );

        return this.issuesReader.readIssues(ticketIds);
      })
    );
  }
}
