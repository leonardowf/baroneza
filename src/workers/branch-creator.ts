import { Observable, from } from 'rxjs';
import { GithubService } from '../services/github-service';

export interface BranchCreator {
  create(sha: string, branchName: string, repository: string): Observable<void>;
}

export class GithubBranchCreator implements BranchCreator {
  private githubService: GithubService;
  private owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  create(
    sha: string,
    branchName: string,
    repository: string
  ): Observable<void> {
    return this.githubService.createBranch(
      this.owner,
      sha,
      branchName,
      repository
    );
  }
}
