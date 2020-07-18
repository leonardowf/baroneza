import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';

export interface CommitExtractor {
  commits(pullNumber: number): Observable<string[]>;
}

export class GithubPullRequestExtractor implements CommitExtractor {
  octokit: Octokit;
  owner: string;
  repo: string;

  constructor(octokit: Octokit, owner: string, repo: string) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }

  commits(pullNumber: number): Observable<string[]> {
    const stream = from(
      this.octokit.pulls.listCommits({
        owner: this.owner,
        repo: this.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullNumber
      })
    )
      .pipe(map((x) => x.data))
      .pipe(map((x) => x.map((y) => y.commit.message)));

    return stream;
  }
}