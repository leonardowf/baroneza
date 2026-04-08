import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GithubPullRequestExtractor,
  GithubShaExtractor,
  ShaWindow
} from '../workers/commit-extractor';
import { JiraTicketParser } from '../workers/jira-ticket-parser';

export type ExtractTicketsInput = {
  readonly reference: number | ShaWindow;
  readonly repository: string;
};

export type ExtractTicketsOutput = {
  readonly ticketIdsCommits: TicketIdCommit[];
};

export type TicketIdCommit = {
  readonly ticketId: string;
  readonly commit: string;
};

export interface ExtractTicketsUseCase {
  execute(input: ExtractTicketsInput): Observable<ExtractTicketsOutput>;
}

export class ConcreteExtractTicketsUseCase implements ExtractTicketsUseCase {
  private readonly pullRequestCommitExtractor: GithubPullRequestExtractor;
  private readonly shaCommitExtractor: GithubShaExtractor;
  private readonly jiraTickerParser: JiraTicketParser;

  constructor(
    pullRequestCommitExtractor: GithubPullRequestExtractor,
    shaCommitExtractor: GithubShaExtractor,
    jiraTickerParser: JiraTicketParser
  ) {
    this.pullRequestCommitExtractor = pullRequestCommitExtractor;
    this.shaCommitExtractor = shaCommitExtractor;
    this.jiraTickerParser = jiraTickerParser;
  }

  execute(input: ExtractTicketsInput): Observable<ExtractTicketsOutput> {
    return this.extractCommits(input)
      .pipe(map((commits) => this.jiraTickerParser.parse(commits)))
      .pipe(
        map((jiraTickerParsedOutput) =>
          jiraTickerParsedOutput.parsedTickets.map(
            (parsedTicket): TicketIdCommit => ({
              ticketId: parsedTicket.ticket,
              commit: parsedTicket.value
            })
          )
        ),
        map((ticketIdsCommits): ExtractTicketsOutput => ({ ticketIdsCommits }))
      );
  }

  private extractCommits(input: ExtractTicketsInput): Observable<string[]> {
    if (typeof input.reference === 'number') {
      return this.pullRequestCommitExtractor.commits(
        input.reference,
        input.repository
      );
    } else if (
      input.reference != null &&
      typeof input.reference === 'object' &&
      typeof (input.reference as ShaWindow).start === 'string' &&
      typeof (input.reference as ShaWindow).end === 'string'
    ) {
      return this.shaCommitExtractor.commits(
        input.reference as ShaWindow,
        input.repository
      );
    } else {
      throw new Error(
        `Invalid reference: expected a pull request number or a ShaWindow object with "start" and "end" SHA strings, got: ${JSON.stringify(input.reference)}`
      );
    }
  }
}
