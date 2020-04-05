import { Observable, of, from } from "rxjs";
import { Octokit } from "@octokit/rest"
import { map } from "rxjs/operators";

export interface CommitExtractor {
    commits(identifier: string): Observable<string[]>
}

export class GithubPullRequestExtractor implements CommitExtractor {
    octokit: Octokit
    owner: string
    repo: string

    constructor(octokit: Octokit, owner: string, repo: string) {
        this.octokit = octokit
        this.owner = owner
        this.repo = repo
    }

    commits(identifier: string): Observable<string[]> {
        const stream = from(this.octokit.pulls.listCommits({
            owner: this.owner,
            repo: this.repo,
            pull_number: 1848
        }))
            .pipe(map(x => x.data))
            .pipe(map(x => x.map(y => y.commit.message)))

        return stream
    }
}


export interface JiraTicketParser {
    parse(values: string[]): string[]
}

export interface JiraTicketTagger {
    tag(ticketIds: string[], tag: String): Observable<JiraTicket>
}

export interface JiraTicket  {

}

export class ConcreteJiraTickerParser implements JiraTicketParser {
    parse(values: string[]): string[] {
        const regex: RegExp = /\[(PSF-\d+)\]/g

        let extractedTicketIds = values.map(x => x.match(regex))
            .map(x => x == null ? [] : x)
            .filter(x => x.length > 0)
            .map(x => x[0])
            .map(x => x.replace("[", ""))
            .map(x => x.replace("]", ""))
        return Array.from(new Set(extractedTicketIds))
    }
    
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
    tag(ticketIds: string[], tag: string): Observable<JiraTicket> {
        return of(new ConcreteJiraTicket())
    }
}

export class ConcreteJiraTicket implements JiraTicket {

}