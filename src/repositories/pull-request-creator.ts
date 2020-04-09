import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';

export class PullRequestCreatorOutput {
  identifier: number;

  constructor(identifier: number) {
    this.identifier = identifier;
  }
}

export interface PullRequestCreator {
  create(
    title: string,
    head: string,
    base: string
  ): Observable<PullRequestCreatorOutput>;
}

export class GithubPullRequestCreator implements PullRequestCreator {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(octokit: Octokit, owner: string, repo: string) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }

  create(
    title: string,
    head: string,
    base: string
  ): Observable<PullRequestCreatorOutput> {
    return from(
      this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        base,
        head
      })
    ).pipe(map((x) => new PullRequestCreatorOutput(x.data.number)));
  }
}
