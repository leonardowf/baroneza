import { Observable, of, from, merge, zip } from "rxjs";
import JiraAPI from "jira-client"
import { materialize } from "rxjs/operators";

export interface JiraTicket  {

}

export interface JiraTicketTagger {
    tag(ticketIds: string[], tag: String): Observable<JiraTicket>
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
    jiraAPI: JiraAPI

    constructor(jiraAPI: JiraAPI) {
        this.jiraAPI = jiraAPI
    }

    tag(ticketIds: string[], tag: string): Observable<JiraTicket> {
        const updatePromises = ticketIds.map(x => this.jiraAPI.updateIssue(x, {
            "update": {
                "fixVersions": [
                    {
                        "set": [{
                            "name": tag
                        }]
                    }
                ]
            }
        }))

        const updateOperations = updatePromises.map(x => from(x).pipe(materialize()))
        zip(updateOperations).subscribe(x => console.log("terminou o zip"))
        

        return of(new ConcreteJiraTicket())
    }
}

export class ConcreteJiraTicket implements JiraTicket {

}