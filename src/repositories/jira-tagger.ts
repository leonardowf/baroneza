import { Observable, of, from, merge, zip, forkJoin } from "rxjs";
import JiraAPI from "jira-client"
import { materialize, catchError, map, toArray, concat } from "rxjs/operators";

export interface JiraTicketTaggetOutput  {
    successes: string[]
    failures: string[]

}

export interface JiraTicketTagger {
    tag(ticketIds: string[], tag: String): Observable<JiraTicketTaggetOutput>
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
    jiraAPI: JiraAPI

    constructor(jiraAPI: JiraAPI) {
        this.jiraAPI = jiraAPI
    }

    tag(ticketIds: string[], tag: string): Observable<JiraTicketTaggetOutput> {
        const streams = ticketIds.map(ticketId => {
            const updateIssuePromise = this.jiraAPI.updateIssue(ticketId, {
                "update": {
                    "fixVersions": [
                        {
                            "set": [{
                                "name": tag
                            }]
                        }
                    ]
                }
            })

            return from(updateIssuePromise)
                .pipe(map(x => { 
                    return { success: true, ticketId: ticketId}
                }))
                .pipe(catchError(error => of({ success: false, ticketId: ticketId } )))
        })

        return forkJoin(streams).pipe(map(x => {
            let failures = x.filter(x => !x.success).map(x => x.ticketId)
            let successes = x.filter(x => x.success).map(x => x.ticketId)
            return { successes, failures }
        })).pipe(map(y => new ConcreteJiraTicketTaggetOutput(y.successes, y.failures)))
 
    }
}

export class ConcreteJiraTicketTaggetOutput implements JiraTicketTaggetOutput {
    successes: string[]
    failures: string[]

    constructor(successes: string[], failures: string[]) {
        this.failures = failures
        this.successes = successes
    }
}