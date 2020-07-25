import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { mapTo } from 'rxjs/operators';

export interface BranchCreator {
  create(sha: string, branchName: string, repository: string): Observable<void>;
}

export class GithubBranchCreator implements BranchCreator {
  private octokit: Octokit;
  private owner: string;

  constructor(octokit: Octokit, owner: string) {
    this.octokit = octokit;
    this.owner = owner;
  }

  create(
    sha: string,
    branchName: string,
    repository: string
  ): Observable<void> {
    return from(
      this.octokit.git.createRef({
        owner: this.owner,
        repo: repository,
        ref: 'refs/heads/' + branchName,
        sha
      })
    ).pipe(mapTo(void 0));
  }
}
