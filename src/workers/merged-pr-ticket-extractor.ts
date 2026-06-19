import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubService } from '../services/github-service';
import { JiraTicketParser } from './jira-ticket-parser';

export interface MergedPRTicketExtractor {
  extract(repo: string, base: string): Observable<string[]>;
}

export class GithubMergedPRTicketExtractor implements MergedPRTicketExtractor {
  private readonly githubService: GithubService;
  private readonly owner: string;
  private readonly jiraTicketParser: JiraTicketParser;

  constructor(
    githubService: GithubService,
    owner: string,
    jiraTicketParser: JiraTicketParser
  ) {
    this.githubService = githubService;
    this.owner = owner;
    this.jiraTicketParser = jiraTicketParser;
  }

  extract(repo: string, base: string): Observable<string[]> {
    return this.githubService
      .listMergedPullRequestTitles(this.owner, repo, base)
      .pipe(
        map((titles) => {
          const { parsedTickets } = this.jiraTicketParser.parse(titles);
          return parsedTickets.map((pt) => pt.ticket);
        })
      );
  }
}
