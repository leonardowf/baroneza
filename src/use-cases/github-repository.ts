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
        console.log(values)
        return ["[PSF-1234]"]
    }
    
}

export class ConcreteJiraTickerTagger implements JiraTicketTagger {
    tag(ticketIds: string[], tag: string): Observable<JiraTicket> {
        return of(new ConcreteJiraTicket())
    }
}

export class ConcreteJiraTicket implements JiraTicket {

}