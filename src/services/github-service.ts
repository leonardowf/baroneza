import { Observable, from, throwError } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { flatMap, map, mapTo } from 'rxjs/operators';
import { PullsMergeResponseData } from '@octokit/types';

export type TimeWidow = {
  readonly since?: string;
  readonly until?: string;
};

export interface PullRequestData {
  readonly number: number;
  readonly login: string;
  readonly description: string;
  readonly mergedAt: string;
  readonly url: string;
  readonly authorImageUrl: string;
  readonly mergeable: boolean;
}

export interface MergeResponseData {
  readonly merged: boolean;
}

export interface CompareResponseData {
  readonly aheadBy: number;
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

  merge(
    owner: string,
    repo: string,
    pullNumber: number
  ): Observable<MergeResponseData>;

  compareCommits(
    owner: string,
    repo: string,
    head: string,
    base: string
  ): Observable<CompareResponseData>;

  updateTitle(
    pullNumber: number,
    title: string,
    owner: string,
    repo: string
  ): Observable<void>;
  updateRelease(
    fromName: string,
    toName: string,
    body: string,
    owner: string,
    repo: string
  ): Observable<void>;
  updateMilestone(
    fromTitle: string,
    toTitle: string,
    owner: string,
    repo: string
  ): Observable<void>;

  releases(owner: string, repo: string): Observable<string[]>;

  latestRelease(owner: string, repo: string): Observable<string>;

  listCommitMessagesFromPullNumber(
    owner: string,
    repo: string,
    pullNumber: number
  ): Observable<string[]>;

  listCommitMessagesFromDate(
    owner: string,
    repo: string,
    timeWidow: TimeWidow
  ): Observable<string[]>;

  getCommit(
    owner: string,
    repo: string,
    ref: string
  ): Observable<{ date: string }>;
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
          description: response.data.body ?? '',
          url: response.data.html_url,
          authorImageUrl: response.data.user.avatar_url,
          mergeable: response.data.mergeable
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
        repo,
        direction: 'desc'
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

  merge(
    owner: string,
    repo: string,
    pullNumber: number
  ): Observable<MergeResponseData> {
    return from(
      this.octokit.pulls.merge({
        owner,
        repo, // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullNumber
      })
    ).pipe(
      map((response) => response.data),
      map((responseData) => {
        const merged = (responseData as PullsMergeResponseData).merged ?? false;
        return { merged };
      })
    );
  }

  compareCommits(
    owner: string,
    repo: string,
    head: string,
    base: string
  ): Observable<CompareResponseData> {
    return from(
      this.octokit.repos.compareCommits({
        owner,
        repo,
        head,
        base
      })
    ).pipe(
      map((response) => response.data),
      map((responseData) => ({ aheadBy: responseData.ahead_by }))
    );
  }

  updateTitle(
    pullNumber: number,
    title: string,
    owner: string,
    repo: string
  ): Observable<void> {
    return from(
      this.octokit.pulls.update({
        title,
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullNumber
      })
    ).pipe(mapTo(void 0));
  }

  updateRelease(
    fromName: string,
    toName: string,
    body: string,
    owner: string,
    repo: string
  ): Observable<void> {
    return from(
      this.octokit.repos.listReleases({
        owner,
        repo
      })
    ).pipe(
      map((response) =>
        response.data.find(
          (release) => release.name.toLowerCase() === fromName.toLowerCase()
        )
      ),
      flatMap((release) => {
        if (release) {
          return from(
            this.octokit.repos.updateRelease({
              body,
              owner,
              repo,
              // eslint-disable-next-line @typescript-eslint/camelcase
              release_id: release.id,
              // eslint-disable-next-line @typescript-eslint/camelcase
              tag_name: toName,
              name: toName
            })
          ).pipe(mapTo(void 0));
        }
        return throwError({
          message: `Unable to find Github release named: ${fromName}`
        });
      })
    );
  }

  updateMilestone(
    fromTitle: string,
    toTitle: string,
    owner: string,
    repo: string
  ): Observable<void> {
    return this.getMilestone(owner, repo, fromTitle).pipe(
      flatMap((milestone) => {
        if (milestone) {
          return from(
            this.octokit.issues.updateMilestone({
              title: toTitle,
              owner,
              repo,
              // eslint-disable-next-line @typescript-eslint/camelcase
              milestone_number: milestone
            })
          ).pipe(mapTo(void 0));
        }

        return throwError({ message: 'Unable to find milestone' });
      })
    );
  }

  releases(owner: string, repo: string): Observable<string[]> {
    return from(this.octokit.repos.listReleases({ owner, repo })).pipe(
      map((response) => response.data.map((release) => release.name))
    );
  }

  latestRelease(owner: string, repo: string): Observable<string> {
    return from(this.octokit.repos.getLatestRelease({ owner, repo })).pipe(
      map((response) => response.data.name)
    );
  }

  listCommitMessagesFromDate(
    owner: string,
    repo: string,
    timeWindow: TimeWidow
  ): Observable<string[]> {
    return from(
      this.octokit.repos.listCommits({
        owner,
        repo,
        since: timeWindow.since,
        until: timeWindow.until
      })
    ).pipe(
      map((response) => response.data),
      map((response) => response.map((commitData) => commitData.commit.message))
    );
  }

  listCommitMessagesFromPullNumber(
    owner: string,
    repo: string,
    pullNumber: number
  ): Observable<string[]> {
    return from(
      this.octokit.pulls.listCommits({
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_number: pullNumber
      })
    ).pipe(
      map((response) => response.data),
      map((data) => data.map((commitData) => commitData.commit.message))
    );
  }

  getCommit(
    owner: string,
    repo: string,
    ref: string
  ): Observable<{ date: string }> {
    return from(
      this.octokit.repos.getCommit({
        owner,
        repo,
        ref
      })
    ).pipe(
      map((response) => response.data),
      map((data) => data.commit.author.date),
      map((date) => ({ date }))
    );
  }
}
