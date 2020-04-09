import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';

export interface SHAFinder {
  execute(branchName: string): Observable<string>;
}

export class GithubSHAFinder implements SHAFinder {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(octokit: Octokit, owner: string, repo: string) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }

  execute(branchName: string): Observable<string> {
    return from(
      this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/' + branchName
      })
    ).pipe(map((x) => x.data.object.sha));
  }
}
