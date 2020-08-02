import { Observable } from 'rxjs';
import { GithubService } from '../services/github-service';

export interface SHAFinder {
  execute(branchName: string, repository: string): Observable<string>;
}

export class GithubSHAFinder implements SHAFinder {
  private githubService: GithubService;
  private owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  execute(branchName: string, repository: string): Observable<string> {
    return this.githubService.getSHA(this.owner, repository, branchName);
  }
}
