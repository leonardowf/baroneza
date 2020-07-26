import { Observable, of, forkJoin } from 'rxjs';
import {
  GithubService,
  PullRequestLoginDescriptionDateOutput
} from '../services/github-service';
import { catchError, filter, map } from 'rxjs/operators';

export interface PullRequestInfoUseCase {
  execute(
    pullRequestNumbers: number[],
    repo: string
  ): Observable<PullRequestInfoUseCaseOutput>;
}

export class PullRequestInfoUseCaseOutput {
  readonly pullRequests: PullRequestInfo[];

  constructor(pullRequests: PullRequestInfo[]) {
    this.pullRequests = pullRequests;
  }
}

export class PullRequestInfo {
  author: string;
  description: string;
  date: string;
  identifier: number;

  constructor(
    author: string,
    description: string,
    date: string,
    identifier: number
  ) {
    this.author = author;
    this.description = description;
    this.date = date;
    this.identifier = identifier;
  }
}

export class GithubPullRequestInfoUseCase implements PullRequestInfoUseCase {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  execute(
    pullRequestNumbers: number[],
    repo: string
  ): Observable<PullRequestInfoUseCaseOutput> {
    const infos = pullRequestNumbers.map((number) =>
      this.githubService
        .pullRequestLoginDescriptionDate(this.owner, repo, number)
        .pipe(catchError(() => of(null)))
    );

    const fetchInfos = forkJoin(infos);

    const succesfulPullRequestInfo = fetchInfos.pipe(
      map((descriptions) => {
        return descriptions.filter(
          (x): x is PullRequestLoginDescriptionDateOutput => x !== null
        );
      })
    );

    return succesfulPullRequestInfo
      .pipe(
        map((loginDescriptionDates) => {
          return loginDescriptionDates.map(
            (x) =>
              new PullRequestInfo(x.login, x.description, x.mergedAt, x.number)
          );
        })
      )
      .pipe(
        map(
          (pullRequestInfos) =>
            new PullRequestInfoUseCaseOutput(pullRequestInfos)
        )
      );
  }
}
