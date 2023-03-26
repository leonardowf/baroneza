import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Issue, JiraService } from '../services/jira-service';

export interface IssuesReader {
  readIssues(ticketIds: string[]): Observable<Issue[]>;
}

export class JiraIssuesReader implements IssuesReader {
  private readonly jiraService: JiraService;

  constructor(jiraService: JiraService) {
    this.jiraService = jiraService;
  }

  readIssues(ticketIds: string[]): Observable<Issue[]> {
    const detailsAndFailures = forkJoin(
      ticketIds.map((ticketId) =>
        this.jiraService.getIssue(ticketId).pipe(
          catchError(() => {
            console.log(`Could not find ticket ${ticketId}`);
            return of(undefined);
          })
        )
      )
    );

    const details = detailsAndFailures.pipe(
      map((details) => {
        const filteredDetails = details.filter(
          (detail) => detail !== undefined
        );
        return filteredDetails as Issue[];
      })
    );

    return details;
  }
}
