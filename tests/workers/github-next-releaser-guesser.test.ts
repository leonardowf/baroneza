import { mock, instance, when, anything } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';
import { of } from 'rxjs';
import { GithubNextReleaseGuesser } from '../../src/workers/next-release-guesser';

describe('the github next release guesser', () => {
  it('fails without semver in the title', (done) => {
    const githubServiceMock = mock<GithubService>();
    const titles: string[] = ['title1'];

    when(
      githubServiceMock.pullRequestTitles(anything(), anything())
    ).thenReturn(of(titles));

    const githubService = instance(githubServiceMock);
    const sut = new GithubNextReleaseGuesser(githubService, 'owner');

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

  it('succeeds with semver in the title', (done) => {
    const githubServiceMock = mock<GithubService>();
    const titles: string[] = ['bla 1.0.0'];

    when(
      githubServiceMock.pullRequestTitles(anything(), anything())
    ).thenReturn(of(titles));

    const githubService = instance(githubServiceMock);

    const sut = new GithubNextReleaseGuesser(githubService, 'owner');
    sut.guess('repository').subscribe({
      next: (version) => {
        expect(version).toEqual('1.0.1');
      },
      error: () => {
        fail();
      },
      complete: done
    });
  });

  it('succeeds with semver in beginning of the title', (done) => {
    const githubServiceMock = mock<GithubService>();
    const titles: string[] = ['1.0.0 bla'];

    when(
      githubServiceMock.pullRequestTitles(anything(), anything())
    ).thenReturn(of(titles));

    const githubService = instance(githubServiceMock);

    const sut = new GithubNextReleaseGuesser(githubService, 'owner');
    sut.guess('repository').subscribe({
      next: (version) => {
        expect(version).toEqual('1.0.1');
        done();
      },
      error: () => {
        fail();
      },
      complete: done
    });
  });
});
