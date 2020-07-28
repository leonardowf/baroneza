import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map, mapTo } from 'rxjs/operators';

export interface GithubService {
  pullRequestTitles(owner: string, repo: string): Observable<string[]>;
  pullRequestLoginDescriptionDate(
    owner: string,
    repo: string,
    number: number
  ): Observable<PullRequestLoginDescriptionDateOutput>;

  createPreRelease(
    tag: string,
    name: string,
    owner: string,
    repo: string,
    body?: string
  ): Observable<void>;
  updateDescription(
    number: number,
    owner: string,
    repo: string,
    body?: string
  ): Observable<void>;
}

export class PullRequestLoginDescriptionDateOutput {
  readonly number: number;
  readonly login: string;
  readonly description: string;
  readonly mergedAt: string;

  constructor(
    number: number,
    login: string,
    description: string,
    mergedAt: string
  ) {
    this.number = number;
    this.login = login;
    this.description = description;
    this.mergedAt = mergedAt;
  }
}

export class ConcreteGithubService implements GithubService {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  pullRequestTitles(owner: string, repo: string): Observable<string[]> {
    return from(
      this.octokit.pulls.list({
        owner: owner,
        repo: repo,
        sort: 'created',
        state: 'all',
        direction: 'desc'
      })
    ).pipe(map((response) => response.data.map((pull) => pull.title)));
  }

  pullRequestLoginDescriptionDate(
    owner: string,
    repo: string,
    number: number
  ): Observable<PullRequestLoginDescriptionDateOutput> {
    return from(
      this.octokit.pulls.get({
        owner,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: number,
        repo: repo
      })
    ).pipe(
      map(
        (response) =>
          new PullRequestLoginDescriptionDateOutput(
            number,
            response.data.user.login,
            response.data.body,
            response.data.merged_at
          )
      )
    );
  }

  createPreRelease(
    tag: string,
    name: string,
    owner: string,
    repo: string,
    body?: string
  ): Observable<void> {
    return from(
      this.octokit.repos.createRelease({
        repo: repo,
        owner: owner,
        // eslint-disable-next-line @typescript-eslint/camelcase
        tag_name: tag,
        name: name,
        draft: true,
        body: body,
        prerelease: true
      })
    ).pipe(mapTo(void 0));
  }

  updateDescription(
    number: number,
    owner: string,
    repo: string,
    body?: string
  ): Observable<void> {
    return from(
      this.octokit.pulls.update({
        owner,
        repo,
        body,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: number
      })
    ).pipe(mapTo(void 0));
  }
}
