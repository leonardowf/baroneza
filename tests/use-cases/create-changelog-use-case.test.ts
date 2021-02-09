import {
  GithubCreateChangelogUseCase,
  CreateChangelogInput
} from '../../src/use-cases/create-changelog-use-case';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import { PullRequestNumberExtractor } from '../../src/workers/pr-number-extractor';
import {
  KeepChangelogParser,
  KeepChangelogOutput
} from '../../src/workers/keep-changelog-parser';
import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from '../../src/workers/keep-changelog-builder/keep-changelog-builder';
import {
  ReadPullRequestInfoUseCase,
  ReadPullRequestInfoUseCaseOutput,
  PullRequestInfo
} from '../../src/use-cases/read-pull-request-info-use-case';
import { of } from 'rxjs';

describe('the create changelog use case', () => {
  it('executes as expected', (done) => {
    const pullRequestNumberExtractorMock = mock<PullRequestNumberExtractor>();
    const pullRequestInfoUseCaseMock = mock<ReadPullRequestInfoUseCase>();
    const keepChangelogParserMock = mock<KeepChangelogParser>();
    const keepChangelogBuilderMock = mock<KeepChangelogBuilder>();

    when(pullRequestNumberExtractorMock.extract(123, 'repository')).thenReturn(
      of([1, 2])
    );
    when(
      pullRequestInfoUseCaseMock.execute(deepEqual([1, 2]), 'repository')
    ).thenReturn(
      of(
        new ReadPullRequestInfoUseCaseOutput([
          new PullRequestInfo('Leo', 'hello', '10/10/10', 123)
        ])
      )
    );
    when(keepChangelogParserMock.parse('hello')).thenReturn(
      new KeepChangelogOutput(['added'], ['b'], ['c'], ['d'], ['e'], ['f'])
    );
    when(
      keepChangelogBuilderMock.build(
        '1.0.0',
        deepEqual([new KeepChangelogItem('added', 'Leo', '10/10/10', '123')]),
        deepEqual([new KeepChangelogItem('b', 'Leo', '10/10/10', '123')]),
        deepEqual([new KeepChangelogItem('c', 'Leo', '10/10/10', '123')]),
        deepEqual([new KeepChangelogItem('d', 'Leo', '10/10/10', '123')]),
        deepEqual([new KeepChangelogItem('e', 'Leo', '10/10/10', '123')]),
        deepEqual([new KeepChangelogItem('f', 'Leo', '10/10/10', '123')])
      )
    ).thenReturn('success');

    const pullRequestNumberExtractor = instance(pullRequestNumberExtractorMock);
    const pullRequestInfoUseCase = instance(pullRequestInfoUseCaseMock);
    const keepChangelogParser = instance(keepChangelogParserMock);
    const keepChangelogBuilder = instance(keepChangelogBuilderMock);

    const sut = new GithubCreateChangelogUseCase(
      pullRequestNumberExtractor,
      pullRequestInfoUseCase,
      keepChangelogParser,
      keepChangelogBuilder
    );

    sut
      .execute(new CreateChangelogInput(123, 'repository', '1.0.0'))
      .subscribe({
        next: (result) => {
          expect(result).toEqual('success');
        },
        complete: done
      });
  });

  it('when parsed as null', (done) => {
    const pullRequestNumberExtractorMock = mock<PullRequestNumberExtractor>();
    const pullRequestInfoUseCaseMock = mock<ReadPullRequestInfoUseCase>();
    const keepChangelogParserMock = mock<KeepChangelogParser>();
    const keepChangelogBuilderMock = mock<KeepChangelogBuilder>();

    when(pullRequestNumberExtractorMock.extract(123, 'repository')).thenReturn(
      of([1, 2])
    );
    when(
      pullRequestInfoUseCaseMock.execute(deepEqual([1, 2]), 'repository')
    ).thenReturn(
      of(
        new ReadPullRequestInfoUseCaseOutput([
          new PullRequestInfo('Leo', 'hello', '10/10/10', 123)
        ])
      )
    );
    when(keepChangelogParserMock.parse('hello')).thenReturn(null);
    when(
      keepChangelogBuilderMock.build(
        '1.0.0',
        deepEqual([]),
        deepEqual([]),
        deepEqual([]),
        deepEqual([]),
        deepEqual([]),
        deepEqual([])
      )
    ).thenReturn(undefined);

    const pullRequestNumberExtractor = instance(pullRequestNumberExtractorMock);
    const pullRequestInfoUseCase = instance(pullRequestInfoUseCaseMock);
    const keepChangelogParser = instance(keepChangelogParserMock);
    const keepChangelogBuilder = instance(keepChangelogBuilderMock);

    const sut = new GithubCreateChangelogUseCase(
      pullRequestNumberExtractor,
      pullRequestInfoUseCase,
      keepChangelogParser,
      keepChangelogBuilder
    );

    sut
      .execute(new CreateChangelogInput(123, 'repository', '1.0.0'))
      .subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
        },
        complete: done
      });
  });
});
