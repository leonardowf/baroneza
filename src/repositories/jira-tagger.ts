import { Observable, of, from, forkJoin } from 'rxjs';
import JiraAPI from 'jira-client';
import { catchError, map } from 'rxjs/operators';

export interface JiraTicketTaggetOutput {
  successes: string[];
  failures: string[];
}

export interface JiraTicketTagger {
  tag(ticketIds: string[], tag: string): Observable<JiraTicketTaggetOutput>;
}

export class ConcreteJiraTicketTaggetOutput implements JiraTicketTaggetOutput {
  successes: string[];
  failures: string[];

  constructor(successes: string[], failures: string[]) {
    this.failures = failures;
    this.successes = successes;
  }
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
  jiraAPI: JiraAPI;

  constructor(jiraAPI: JiraAPI) {
    this.jiraAPI = jiraAPI;
  }

  tag(ticketIds: string[], tag: string): Observable<JiraTicketTaggetOutput> {
    const streams = ticketIds.map((ticketId) => {
      const updateIssuePromise = this.jiraAPI.updateIssue(ticketId, {
        update: {
          fixVersions: [
            {
              set: [
                {
                  name: tag
                }
              ]
            }
          ]
        }
      });

      return from(updateIssuePromise)
        .pipe(
          map(() => {
            return { success: true, ticketId: ticketId };
          })
        )
        .pipe(catchError(() => of({ success: false, ticketId: ticketId })));
    });

    return forkJoin(streams)
      .pipe(
        map((x) => {
          const failures = x.filter((x) => !x.success).map((x) => x.ticketId);
          const successes = x.filter((x) => x.success).map((x) => x.ticketId);
          return { successes, failures };
        })
      )
      .pipe(
        map((y) => new ConcreteJiraTicketTaggetOutput(y.successes, y.failures))
      );
  }
}
