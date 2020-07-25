import { Observable, of } from "rxjs";
import { CommitExtractor } from "./commit-extractor";
import { map } from "rxjs/operators";

export interface PullRequestNumberExtractor {
    extract(pullRequest: number): Observable<number[]>
}

export class GithubPullRequestNumberExtractor {
    private readonly commitExtractor: CommitExtractor

    constructor(commitExtractor: CommitExtractor) {
        this.commitExtractor = commitExtractor
    }

    extract(pullNumber: number, repository: string): Observable<number[]> {
        return this.commitExtractor.commits(pullNumber, repository).pipe(
            map((commits) => {
                return commits.map((commit) => {
                    const match = commit.match(/(?:#)(\d+)/)
                    if (match !== null) {
                        const asNumber: number = +match[1]
                        return asNumber
                    }
                    return null
                }).filter((x): x is number => x !== null);
            })
        )
    }
}