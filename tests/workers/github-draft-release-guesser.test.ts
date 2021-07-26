import { GithubDraftReleaseGuesser } from '../../src/workers/github-draft-release-guesser';
import { GithubServiceMock } from '../mocks/github-service-mock';

let githubServiceMock: GithubServiceMock;
const owner = 'owner';
const repo = 'repo';

const buildSut = (): GithubDraftReleaseGuesser => {
  return new GithubDraftReleaseGuesser(githubServiceMock.build(), owner);
};

describe('the github draft release guesser', () => {
  beforeEach(() => {
    githubServiceMock = new GithubServiceMock(owner, repo);
  });

  describe('with valid releases github response', () => {
    it('returns error with no releases', (done) => {
      githubServiceMock = githubServiceMock.withReleases([]);
      const sut = buildSut();
      sut.guess(repo, 'patch').subscribe({
        next: () => fail('Call should have failed'),
        error: () => done()
      });
    });

    it('returns error with invalid release name', (done) => {
      githubServiceMock = githubServiceMock.withReleases([
        'invalid release name'
      ]);
      const sut = buildSut();
      sut.guess(repo, 'patch').subscribe({
        next: () => fail('Call should have failed'),
        error: () => done()
      });
    });

    it('returns 1 release with valid release', (done) => {
      githubServiceMock = githubServiceMock.withReleases(['1.0.0']);
      const sut = buildSut();
      sut.guess(repo, 'patch').subscribe({
        next: (version) => {
          expect(version).toBe('1.0.1');
          done();
        },
        error: () => fail('Call should not have failed')
      });
    });

    it('bumps correctly (minor)', (done) => {
      githubServiceMock = githubServiceMock.withReleases(['1.0.0']);
      const sut = buildSut();
      sut.guess(repo, 'minor').subscribe({
        next: (version) => {
          expect(version).toBe('1.1.0');
          done();
        },
        error: () => fail('Call should not have failed')
      });
    });

    it('bumps correctly (major)', (done) => {
      githubServiceMock = githubServiceMock.withReleases(['1.0.0']);
      const sut = buildSut();
      sut.guess(repo, 'minor').subscribe({
        next: (version) => {
          expect(version).toBe('1.1.0');
          done();
        },
        error: () => fail('Call should not have failed')
      });
    });

    it('bumps correctly (prerelease)', (done) => {
      githubServiceMock = githubServiceMock.withReleases(['1.0.0']);
      const sut = buildSut();
      sut.guess(repo, 'prerelease').subscribe({
        next: (version) => {
          expect(version).toBe('1.0.1-0');
          done();
        },
        error: () => fail('Call should not have failed')
      });
    });

    it('returns the most recent with valid release', (done) => {
      githubServiceMock = githubServiceMock.withReleases([
        '0.5.0',
        '1.0.0',
        '0.3.0'
      ]);
      const sut = buildSut();
      sut.guess(repo, 'patch').subscribe({
        next: (version) => {
          expect(version).toBe('1.0.1');
          done();
        },
        error: () => fail('Call should not have failed')
      });
    });
  });

  describe('with error release github response', () => {
    beforeEach(() => {
      githubServiceMock = githubServiceMock.releasesFailed();
    });

    it('throws error', (done) => {
      const sut = buildSut();

      sut.guess(repo, 'patch').subscribe({
        next: () => fail('Call should have failed'),
        error: () => done()
      });
    });
  });
});
