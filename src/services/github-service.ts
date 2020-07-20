import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';

export interface GithubService {
  pullRequestTitles(owner: string, repo: string): Observable<string[]>;
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
}
