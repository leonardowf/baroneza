import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GithubService,
  OpenPullRequestSummary
} from '../services/github-service';

export interface UnmergedPRsFetcher {
  fetch(
    repository: string,
    baseBranch: string
  ): Observable<OpenPullRequestSummary[]>;
}

export class GithubUnmergedPRsFetcher implements UnmergedPRsFetcher {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  fetch(
    repository: string,
    baseBranch: string
  ): Observable<OpenPullRequestSummary[]> {
    return zip(
      this.githubService.listOpenPullRequestsAgainstBranch(
        this.owner,
        repository,
        baseBranch
      ),
      this.githubService.latestReleaseDate(this.owner, repository)
    ).pipe(
      map(([prs, lastReleaseDate]) => {
        if (!lastReleaseDate) return prs;
        return prs.filter((pr) => pr.createdAt >= lastReleaseDate);
      })
    );
  }
}
