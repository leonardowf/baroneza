import { Observable, of } from "rxjs";

export interface CommitExtractor {
    commits(identifier: string): Observable<[string]>
}

export class GithubPullRequestExtractor implements CommitExtractor {
    owner: string
    repo: string

    constructor(owner: string, repo: string) {
        this.owner = owner
        this.repo = repo
    }

    commits(identifier: string): Observable<[string]> {
        return of(["oi"])
    }
}


export interface JiraTicketParser {
    parse(values: [string]): [String]
}

export interface JiraTicketTagger {
    tag(ticketIds: [String], tag: String): Observable<JiraTicket>
}

export interface JiraTicket  {

}

export class ConcreteJiraTickerParser implements JiraTicketParser {
    parse(values: [string]): [String] {
        return ["[PSF-1234]"]
    }
    
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
    tag(ticketIds: [String], tag: String): Observable<JiraTicket> {
        return of(new ConcreteJiraTicket())
    }
}

export class ConcreteJiraTicket implements JiraTicket {

}