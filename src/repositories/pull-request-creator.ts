import { Observable, of } from "rxjs";
import { Octokit } from "@octokit/rest";
import { mapTo } from "rxjs/operators";

export class PullRequestCreatorOutput {

}

export interface PullRequestCreator {
    create(title: string, head: string, base: string): Observable<PullRequestCreatorOutput>
}

export class GithubPullRequestCreator implements PullRequestCreator {
    private octokit: Octokit
    private owner: string
    private repo: string

    constructor(octokit: Octokit, owner: string, repo: string) {
        this.octokit = octokit
        this.owner = owner
        this.repo = repo
    }

    create(title: string, head: string, base: string): Observable<PullRequestCreatorOutput> {
        return of(this.octokit.pulls.create({
            owner: this.owner,
            repo: this.repo,
            title,
            base,
            head
        })).pipe(mapTo(new PullRequestCreatorOutput()))
    }
}