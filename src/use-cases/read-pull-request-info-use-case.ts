import { Observable, of, forkJoin } from 'rxjs';
import { GithubService, PullRequestData } from '../services/github-service';
import { catchError, map } from 'rxjs/operators';

export interface ReadPullRequestInfoUseCase {
  execute(
    pullRequestNumbers: number[],
    repo: string
  ): Observable<ReadPullRequestInfoUseCaseOutput>;
}

export class ReadPullRequestInfoUseCaseOutput {
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
  url: string;
  authorImageUrl: string;

  constructor(
    author: string,
    description: string,
    date: string,
    identifier: number,
    url: string,
    authorImageUrl: string
  ) {
    this.author = author;
    this.description = description;
    this.date = date;
    this.identifier = identifier;
    this.url = url;
    this.authorImageUrl = authorImageUrl;
  }
}

export class GithubPullRequestInfoUseCase
  implements ReadPullRequestInfoUseCase {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  execute(
    pullRequestNumbers: number[],
    repo: string
  ): Observable<ReadPullRequestInfoUseCaseOutput> {
    const infos = pullRequestNumbers.map((number) =>
      this.githubService
        .pullRequestData(this.owner, repo, number)
        .pipe(catchError(() => of(null)))
    );

    const fetchInfos = forkJoin(infos);

    const succesfulPullRequestInfo = fetchInfos.pipe(
      map((descriptions) => {
        return descriptions.filter((x): x is PullRequestData => x !== null);
      })
    );

    return succesfulPullRequestInfo
      .pipe(
        map((loginDescriptionDates) => {
          return loginDescriptionDates.map(
            (x) =>
              new PullRequestInfo(
                x.login,
                x.description,
                x.mergedAt,
                x.number,
                x.url,
                x.authorImageUrl
              )
          );
        })
      )
      .pipe(
        map(
          (pullRequestInfos) =>
            new ReadPullRequestInfoUseCaseOutput(pullRequestInfos)
        )
      );
  }
}
