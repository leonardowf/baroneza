import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JiraService } from '../services/jira-service';

export type QAPlanCheckResult = {
  readonly missingQAPlan: string[];
};

export interface QAPlanChecker {
  check(ticketIds: string[], qaFieldId: string): Observable<QAPlanCheckResult>;
}

export class ConcreteJiraQAPlanChecker implements QAPlanChecker {
  private readonly jiraService: JiraService;

  constructor(jiraService: JiraService) {
    this.jiraService = jiraService;
  }

  check(ticketIds: string[], qaFieldId: string): Observable<QAPlanCheckResult> {
    if (ticketIds.length === 0) {
      return of({ missingQAPlan: [] });
    }

    return forkJoin(
      ticketIds.map((id) =>
        this.jiraService
          .hasQAPlan(id, qaFieldId)
          .pipe(map((hasPlan) => ({ id, hasPlan })))
      )
    ).pipe(
      map((results) => ({
        missingQAPlan: results.filter((r) => !r.hasPlan).map((r) => r.id)
      }))
    );
  }
}
