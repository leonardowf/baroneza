import { GithubMergeBackUseCase } from '../../src/use-cases/merge-back-use-case';
import { Mocks } from '../mocks/mocks';

describe('the merge back use case', () => {
  describe('given an release brach ahead of base', () => {
    describe('given an unmergeable PR', () => {
      it('when executing then it returns not mergeable', (done) => {
        const pullNumber = 1;
        const aheadBy = 1;
        const githubService = Mocks.githubService('owner', 'repo')
          .compareAheadBy('head', 'base', aheadBy)
          .unmergeablePR(pullNumber)
          .build();
        const pullRequestCreator = Mocks.githubPullRequestCreator()
          .succesful()
          .build();

        const sut = new GithubMergeBackUseCase(
          'owner',
          pullRequestCreator,
          githubService
        );

        sut
          .execute({ head: 'head', base: 'base', repository: 'repo' })
          .subscribe({
            next: (response) => {
              expect(response.type).toEqual('NOT_MERGEABLE');
            },
            error: fail,
            complete: done
          });
      });
    });

    describe('given a mergeable PR', () => {
      describe('given merge fails', () => {
        it('when executing then it returns FAILED TO MERGE', (done) => {
          const pullNumber = 1;
          const aheadBy = 1;
          const githubService = Mocks.githubService('owner', 'repo')
            .compareAheadBy('head', 'base', aheadBy)
            .mergeablePR(pullNumber)
            .mergeFailed(pullNumber)
            .build();
          const pullRequestCreator = Mocks.githubPullRequestCreator()
            .succesful()
            .build();

          const sut = new GithubMergeBackUseCase(
            'owner',
            pullRequestCreator,
            githubService
          );

          sut
            .execute({ head: 'head', base: 'base', repository: 'repo' })
            .subscribe({
              next: (response) => {
                expect(response.type).toEqual('FAILED_TO_MERGE');
              },
              error: fail,
              complete: done
            });
        });
      });

      describe('given merge succeeds', () => {
        it('when executing then it returns SUCCESS', (done) => {
          const pullNumber = 1;
          const aheadBy = 1;
          const githubService = Mocks.githubService('owner', 'repo')
            .compareAheadBy('head', 'base', aheadBy)
            .mergeablePR(pullNumber)
            .mergeSucceeded(pullNumber)
            .build();
          const pullRequestCreator = Mocks.githubPullRequestCreator()
            .succesful()
            .build();

          const sut = new GithubMergeBackUseCase(
            'owner',
            pullRequestCreator,
            githubService
          );

          sut
            .execute({ head: 'head', base: 'base', repository: 'repo' })
            .subscribe({
              next: (response) => {
                expect(response.type).toEqual('SUCCESS');
              },
              error: fail,
              complete: done
            });
        });
      });
    });
  });

  describe('given an release brach at same level of base', () => {
    it('when executing then it returns NO_MERGE_NEEDED', (done) => {
      const aheadBy = 0;
      const githubService = Mocks.githubService('owner', 'repo')
        .compareAheadBy('head', 'base', aheadBy)
        .build();
      const pullRequestCreator = Mocks.githubPullRequestCreator()
        .succesful()
        .build();

      const sut = new GithubMergeBackUseCase(
        'owner',
        pullRequestCreator,
        githubService
      );

      sut
        .execute({ head: 'head', base: 'base', repository: 'repo' })
        .subscribe({
          next: (response) => {
            expect(response.type).toEqual('NO_MERGE_NEEDED');
          },
          error: fail,
          complete: done
        });
    });
  });
});
