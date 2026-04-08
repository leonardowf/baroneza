import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { log } from '../logger';
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
      .pipe(tap((commits) => log(`[ExtractTickets] fetched ${commits.length} commits from repository "${input.repository}"`)))
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
        tap((ticketIdsCommits) => log(`[ExtractTickets] parsed ${ticketIdsCommits.length} Jira tickets: ${ticketIdsCommits.map((t) => t.ticketId).join(', ')}`)),
        map((ticketIdsCommits): ExtractTicketsOutput => ({ ticketIdsCommits }))
      );
  }

  private extractCommits(input: ExtractTicketsInput): Observable<string[]> {
    if (typeof input.reference === 'number') {
      log(`[ExtractTickets] extracting commits from PR #${input.reference} in "${input.repository}"`);
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
      const window = input.reference as ShaWindow;
      log(`[ExtractTickets] extracting commits from SHA window ${window.start}..${window.end} in "${input.repository}"`);
      return this.shaCommitExtractor.commits(window, input.repository);
    } else {
      throw new Error(
        `Invalid reference: expected a pull request number or a ShaWindow object with "start" and "end" SHA strings, got: ${JSON.stringify(input.reference)}`
      );
    }
  }
}
