import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommitExtractor } from '../workers/commit-extractor';
import { JiraTicketParser } from '../workers/jira-ticket-parser';

export type ExtractTicketsInput = {
  readonly pullRequestNumber: number;
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
  private readonly commitExtractor: CommitExtractor;
  private readonly jiraTickerParser: JiraTicketParser;

  constructor(
    commitExtractor: CommitExtractor,
    jiraTickerParser: JiraTicketParser
  ) {
    this.commitExtractor = commitExtractor;
    this.jiraTickerParser = jiraTickerParser;
  }

  execute(input: ExtractTicketsInput): Observable<ExtractTicketsOutput> {
    return this.commitExtractor
      .commits(input.pullRequestNumber, input.repository)
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
}
