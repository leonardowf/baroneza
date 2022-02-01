import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { flatMap, map } from 'rxjs/operators';
import { OctokitResponse, ReposGetCommitResponseData } from '@octokit/types';

export type ShaWindow = {
  readonly start: string;
  readonly end: string;
};

export interface CommitExtractor {
  commits(
    reference: number | ShaWindow,
    repository: string
  ): Observable<string[]>;
}

export class GithubPullRequestExtractor implements CommitExtractor {
  octokit: Octokit;
  owner: string;

  constructor(octokit: Octokit, owner: string) {
    this.octokit = octokit;
    this.owner = owner;
  }

  commits(pullNumber: number, repository: string): Observable<string[]> {
    const stream = from(
      this.octokit.pulls.listCommits({
        owner: this.owner,
        repo: repository,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullNumber
      })
    )
      .pipe(map((x) => x.data))
      .pipe(map((x) => x.map((y) => y.commit.message)));

    return stream;
  }
}

export class GithubShaExtractor implements CommitExtractor {
  octokit: Octokit;
  owner: string;

  constructor(octokit: Octokit, owner: string) {
    this.octokit = octokit;
    this.owner = owner;
  }

  commits(shaWindow: ShaWindow, repository: string): Observable<string[]> {
    const stream = from(this.getCommitBounds(shaWindow, repository))
      .pipe(
        flatMap((x) =>
          this.octokit.repos.listCommits({
            owner: this.owner,
            repo: repository,
            // eslint-disable-next-line @typescript-eslint/camelcase
            since: x[0].data.commit.author.date,
            until: x[1].data.commit.author.date
          })
        )
      )
      .pipe(map((x) => x.data))
      .pipe(map((x) => x.map((y) => y.commit.message)));

    return stream;
  }

  private getCommitBounds(
    shaWindow: ShaWindow,
    repository: string
  ): Promise<
    [
      OctokitResponse<ReposGetCommitResponseData>,
      OctokitResponse<ReposGetCommitResponseData>
    ]
  > {
    return Promise.all([
      this.octokit.repos.getCommit({
        owner: this.owner,
        repo: repository,
        ref: shaWindow.start
      }),
      this.octokit.repos.getCommit({
        owner: this.owner,
        repo: repository,
        ref: shaWindow.end
      })
    ]);
  }
}
