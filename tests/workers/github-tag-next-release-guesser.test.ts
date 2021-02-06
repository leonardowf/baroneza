import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';
import { GithubTagNextReleaseGuesser } from '../../src/workers/github-tag-next-release-guesser';

describe('the github tag next release guesser', () => {
  it('fails without tags in the repo', (done) => {
    const githubServiceMock = mock<GithubService>();

    when(githubServiceMock.tags(anything(), anything())).thenReturn(of([]));

    const githubService = instance(githubServiceMock);

    const sut = new GithubTagNextReleaseGuesser(githubService, 'owner');

    sut.guess('repository').subscribe({
      next: () => {
        fail();
      },
      error: () => {
        done();
      },
      complete: done
    });
  });

  it('removes annoying V from tags', (done) => {
    const githubServiceMock = mock<GithubService>();

    when(githubServiceMock.tags(anything(), anything())).thenReturn(
      of(['v1.0.0', 'v1.0.1', 'v1.0.2'])
    );

    const githubService = instance(githubServiceMock);

    const sut = new GithubTagNextReleaseGuesser(githubService, 'owner');

    sut.guess('repository').subscribe({
      next: (v) => {
        expect(v).toBe('1.0.3');
      },
      error: () => {
        fail();
      },
      complete: done
    });
  });

  it('does not crash with non semver tags', (done) => {
    const githubServiceMock = mock<GithubService>();

    when(githubServiceMock.tags(anything(), anything())).thenReturn(
      of(['banana', 'v1.0.1', 'v1.0.2', 'apple'])
    );

    const githubService = instance(githubServiceMock);

    const sut = new GithubTagNextReleaseGuesser(githubService, 'owner');

    sut.guess('repository').subscribe({
      next: (v) => {
        expect(v).toBe('1.0.3');
      },
      error: () => {
        fail();
      },
      complete: done
    });
  });
});
