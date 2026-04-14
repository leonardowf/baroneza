import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubService } from '../services/github-service';

export interface ReleaseChangesChecker {
  hasChanges(
    repository: string,
    baseBranch: string,
    targetBranch: string
  ): Observable<boolean>;
}

export class GithubReleaseChangesChecker implements ReleaseChangesChecker {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  hasChanges(
    repository: string,
    baseBranch: string,
    targetBranch: string
  ): Observable<boolean> {
    return this.githubService
      .compareCommits(this.owner, repository, baseBranch, targetBranch)
      .pipe(map((comparison) => comparison.aheadBy > 0));
  }
}
