import { GithubPullRequestNumberExtractor } from '../../src/workers/pr-number-extractor';
import { mock, when, instance } from 'ts-mockito';
import { CommitExtractor } from '../../src/workers/commit-extractor';
import { of } from 'rxjs';
import { ConcreteCommitPRNumberParser } from '../../src/workers/keep-changelog-builder/commits-pr-number-parser';

describe('the pr-number-extractor', () => {
  it('finds pr numbers correctly', (done) => {
    const commits: string[] = [
      'blabla #145',
      'blabla (#15)',
      '#14785 blaabla',
      'Annoying Merge commit message that should be a rebase instead',
      '#madvillainy'
    ];

    const commitExtractorMock = mock<CommitExtractor>();
    when(commitExtractorMock.commits(123, 'repository')).thenReturn(
      of(commits)
    );
    const commitExtractor = instance(commitExtractorMock);
    const commitPRNumberParser = new ConcreteCommitPRNumberParser();

    const sut = new GithubPullRequestNumberExtractor(
      commitExtractor,
      commitPRNumberParser
    );

    sut.extract(123, 'repository').subscribe({
      next: (numbers) => {
        expect(numbers).toEqual([145, 15, 14785]);
      },
      complete: done
    });
  });
});
