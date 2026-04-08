import { Observable, of, from, forkJoin, defer } from 'rxjs';
import JiraAPI from 'jira-client';
import { catchError, map } from 'rxjs/operators';
import { log, logError } from '../logger';

export interface JiraTicketTaggetOutput {
  readonly successes: string[];
  readonly failures: string[];
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
    log(`[JiraTagger] tagging ${ticketIds.length} tickets with "${tag}"`);
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

      return defer(() => from(updateIssuePromise))
        .pipe(
          map(() => {
            return { success: true, ticketId: ticketId };
          })
        )
        .pipe(catchError((err) => {
          logError(`[JiraTagger] failed to tag ticket ${ticketId} with "${tag}"`, err);
          return of({ success: false, ticketId: ticketId });
        }));
    });

    return forkJoin(streams)
      .pipe(
        map((x) => {
          const failures = x.filter((x) => !x.success).map((x) => x.ticketId);
          const successes = x.filter((x) => x.success).map((x) => x.ticketId);
          log(`[JiraTagger] done — successes=${successes.length} failures=${failures.length}`);
          return { successes, failures };
        })
      )
      .pipe(
        map((y) => new ConcreteJiraTicketTaggetOutput(y.successes, y.failures))
      );
  }
}
