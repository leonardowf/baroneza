import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map, mapTo } from 'rxjs/operators';

export interface PullRequestData {
  readonly number: number;
  readonly login: string;
  readonly description: string;
  readonly mergedAt: string;
  readonly url: string;
  readonly authorImageUrl: string
}

export interface GithubService {
  pullRequestTitles(owner: string, repo: string): Observable<string[]>;
  pullRequestData(
    owner: string,
    repo: string,
    number: number
  ): Observable<PullRequestData>;

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

  createBranch(
    owner: string,
    sha: string,
    branchName: string,
    repository: string
  ): Observable<void>;

  getSHA(owner: string, repo: string, branchName: string): Observable<string>;

  getMilestone(
    owner: string,
    repo: string,
    title: string
  ): Observable<number | undefined>;

  createMilestone(
    owner: string,
    repo: string,
    title: string
  ): Observable<number>;

  setMilestoneToPR(
    owner: string,
    repo: string,
    milestoneId: number,
    prNumber: number
  ): Observable<void>;

  tags(owner: string, repo: string): Observable<string[]>;
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

  pullRequestData(
    owner: string,
    repo: string,
    number: number
  ): Observable<PullRequestData> {
    return from(
      this.octokit.pulls.get({
        owner,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: number,
        repo: repo
      })
    ).pipe(
      map(
        (response): PullRequestData => ({
          number: number,
          login: response.data.user.login,
          mergedAt: response.data.merged_at,
          description: response.data.body,
          url: response.data.html_url,
          authorImageUrl: response.data.user.avatar_url
        })
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

  createBranch(
    owner: string,
    sha: string,
    branchName: string,
    repository: string
  ): Observable<void> {
    return from(
      this.octokit.git.createRef({
        owner: owner,
        repo: repository,
        ref: 'refs/heads/' + branchName,
        sha
      })
    ).pipe(mapTo(void 0));
  }

  getSHA(owner: string, repo: string, branchName: string): Observable<string> {
    return from(
      this.octokit.git.getRef({
        owner: owner,
        repo,
        ref: 'heads/' + branchName
      })
    ).pipe(map((x) => x.data.object.sha));
  }

  createMilestone(
    owner: string,
    repo: string,
    title: string
  ): Observable<number> {
    return from(
      this.octokit.issues.createMilestone({
        owner,
        repo,
        title
      })
    ).pipe(map((x) => x.data.number));
  }

  getMilestone(
    owner: string,
    repo: string,
    title: string
  ): Observable<number | undefined> {
    return from(
      this.octokit.issues.listMilestones({
        owner,
        repo
      })
    ).pipe(
      map((response) => {
        return response.data.filter((x) => x.title === title).shift()?.number;
      })
    );
  }

  setMilestoneToPR(
    owner: string,
    repo: string,
    milestoneId: number,
    prNumber: number
  ): Observable<void> {
    return from(
      this.octokit.issues.update({
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        issue_number: prNumber,
        milestone: milestoneId
      })
    ).pipe(mapTo(void 0));
  }

  tags(owner: string, repo: string): Observable<string[]> {
    return from(
      this.octokit.git.listMatchingRefs({
        owner,
        repo,
        ref: 'tags/'
      })
    ).pipe(
      map((res) => {
        return res.data.map((data) => {
          return data.ref.replace('refs/tags/', '');
        });
      })
    );
  }
}
