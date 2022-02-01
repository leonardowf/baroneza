import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { flatMap, map } from 'rxjs/operators';

export interface CommitExtractor {
  commits(reference: number | string, repository: string): Observable<string[]>;
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

  commits(sha: string, repository: string): Observable<string[]> {
    const promise = this.octokit.repos.getCommit({
      owner: this.owner,
      repo: repository,
      ref: sha
    });

    const stream = from(promise)
      .pipe(
        flatMap((x) =>
          this.octokit.repos.listCommits({
            owner: this.owner,
            repo: repository,
            // eslint-disable-next-line @typescript-eslint/camelcase
            since: x.data.commit.author.date
          })
        )
      )
      .pipe(map((x) => x.data))
      .pipe(map((x) => x.map((y) => y.commit.message)));

    return stream;
  }
}
