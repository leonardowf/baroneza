import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';

export interface SHAFinder {
  execute(branchName: string, repository: string): Observable<string>;
}

export class GithubSHAFinder implements SHAFinder {
  private octokit: Octokit;
  private owner: string;

  constructor(octokit: Octokit, owner: string) {
    this.octokit = octokit;
    this.owner = owner;
  }

  execute(branchName: string, repository: string): Observable<string> {
    return from(
      this.octokit.git.getRef({
        owner: this.owner,
        repo: repository,
        ref: 'heads/' + branchName
      })
    ).pipe(map((x) => x.data.object.sha));
  }
}
