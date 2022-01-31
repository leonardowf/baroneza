import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CommitExtractor,
  GithubPullRequestExtractor,
  GithubShaExtractor
} from '../workers/commit-extractor';
import { JiraTicketParser } from '../workers/jira-ticket-parser';

export type ExtractTicketsInput = {
  readonly reference: number | string;
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
    } else {
      return this.shaCommitExtractor.commits(input.reference, input.repository);
    }
  }
}
