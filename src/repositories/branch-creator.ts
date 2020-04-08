import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { mapTo } from 'rxjs/operators';

export interface BranchCreator {
  create(sha: string, branchName: string): Observable<void>;
}

export class GithubBranchCreator implements BranchCreator {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(octokit: Octokit, repo: string, owner: string) {
    this.repo = repo;
    this.octokit = octokit;
    this.owner = owner;
  }

  create(sha: string, branchName: string): Observable<void> {
    return from(
      this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'refs/heads/' + branchName,
        sha
      })
    ).pipe(mapTo(void 0));
  }
}
