import { Observable, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { GithubService } from '../services/github-service';
import { ShaWindow } from '../shared/sha-window';

export interface CommitExtractor {
  commits(
    reference: number | ShaWindow,
    repository: string
  ): Observable<string[]>;
}

export class GithubPullRequestExtractor implements CommitExtractor {
  readonly githubService: GithubService;
  readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  commits(pullNumber: number, repository: string): Observable<string[]> {
    return this.githubService.listCommitMessagesFromPullNumber(
      this.owner,
      repository,
      pullNumber
    );
  }
}

export class GithubShaExtractor implements CommitExtractor {
  readonly githubService: GithubService;
  readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  commits(shaWindow: ShaWindow, repository: string): Observable<string[]> {
    return this.getCommitBounds(shaWindow, repository).pipe(
      flatMap((x) =>
        this.githubService.listCommitMessagesFromDate(this.owner, repository, {
          since: x[0].date,
          until: x[1].date
        })
      )
    );
  }

  private getCommitBounds(
    shaWindow: ShaWindow,
    repository: string
  ): Observable<[{ date: string }, { date: string }]> {
    return forkJoin([
      this.githubService.getCommit(this.owner, repository, shaWindow.start),
      this.githubService.getCommit(this.owner, repository, shaWindow.end)
    ]);
  }
}
