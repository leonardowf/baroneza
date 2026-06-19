import { GithubService, OpenPullRequestSummary } from '../../src/services/github-service';
import { GithubUnmergedPRsFetcher } from '../../src/workers/unmerged-prs-fetcher';
import { mock, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('The unmerged PRs fetcher', () => {
  it('returns all PRs when no releases exist', (done) => {
    const githubServiceMock = mock<GithubService>();
    const prs: OpenPullRequestSummary[] = [
      { number: 1, title: 'PR 1', author: 'author', url: 'url/1', createdAt: '2026-01-01T00:00:00Z' },
      { number: 2, title: 'PR 2', author: 'author', url: 'url/2', createdAt: '2026-01-02T00:00:00Z' }
    ];

    when(githubServiceMock.listOpenPullRequestsAgainstBranch('owner', 'repo', 'develop')).thenReturn(of(prs));
    when(githubServiceMock.latestReleaseDate('owner', 'repo')).thenReturn(of(undefined));

    const sut = new GithubUnmergedPRsFetcher(instance(githubServiceMock), 'owner');

    sut.fetch('repo', 'develop').subscribe({
      next: (result) => {
        expect(result).toEqual(prs);
      },
      complete: done
    });
  });

  it('filters out PRs created before the last release', (done) => {
    const githubServiceMock = mock<GithubService>();
    const oldPR: OpenPullRequestSummary = { number: 1, title: 'PR 1', author: 'author', url: 'url/1', createdAt: '2026-01-01T00:00:00Z' };
    const newPR: OpenPullRequestSummary = { number: 2, title: 'PR 2', author: 'author', url: 'url/2', createdAt: '2026-01-03T00:00:00Z' };

    when(githubServiceMock.listOpenPullRequestsAgainstBranch('owner', 'repo', 'develop')).thenReturn(of([oldPR, newPR]));
    when(githubServiceMock.latestReleaseDate('owner', 'repo')).thenReturn(of('2026-01-02T00:00:00Z'));

    const sut = new GithubUnmergedPRsFetcher(instance(githubServiceMock), 'owner');

    sut.fetch('repo', 'develop').subscribe({
      next: (result) => {
        expect(result).toEqual([newPR]);
      },
      complete: done
    });
  });

  it('returns empty array when all PRs predate the last release', (done) => {
    const githubServiceMock = mock<GithubService>();
    const prs: OpenPullRequestSummary[] = [
      { number: 1, title: 'PR 1', author: 'author', url: 'url/1', createdAt: '2026-01-01T00:00:00Z' },
      { number: 2, title: 'PR 2', author: 'author', url: 'url/2', createdAt: '2026-01-01T12:00:00Z' }
    ];

    when(githubServiceMock.listOpenPullRequestsAgainstBranch('owner', 'repo', 'develop')).thenReturn(of(prs));
    when(githubServiceMock.latestReleaseDate('owner', 'repo')).thenReturn(of('2026-01-02T00:00:00Z'));

    const sut = new GithubUnmergedPRsFetcher(instance(githubServiceMock), 'owner');

    sut.fetch('repo', 'develop').subscribe({
      next: (result) => {
        expect(result).toEqual([]);
      },
      complete: done
    });
  });
});
