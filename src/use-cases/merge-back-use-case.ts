import { PullsMergeResponseData } from '@octokit/types';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GithubService, PullRequestData } from '../services/github-service';
import { GithubPullRequestCreator } from '../workers/pull-request-creator';

export interface MergeBackUseCase {
  execute(input: MergeBackUseCaseInput): Observable<MergeBackUseCaseOutput>;
}

export interface MergeBackUseCaseInput {
  readonly head: string;
  readonly base: string;
  readonly repository: string;
}

export type MergeBackUseCaseOutput =
  | SuccessMergeBackUseCaseOutput
  | FailedToMergeMergeBackUseCaseOutput
  | NoMergeNeededMergeMergeBackUseCaseOutput
  | NotMergeableMergeMergeBackUseCaseOutput;
export type KnownMergeBackUseCaseOutputType =
  | 'SUCCESS'
  | 'FAILED_TO_MERGE'
  | 'NO_MERGE_NEEDED'
  | 'NOT_MERGEABLE';
export interface MergeBackUseCaseOutputType {
  type: KnownMergeBackUseCaseOutputType;
}

export interface SuccessMergeBackUseCaseOutput
  extends MergeBackUseCaseOutputType {
  type: 'SUCCESS';
  pullRequestData: PullRequestData;
}

export interface FailedToMergeMergeBackUseCaseOutput
  extends MergeBackUseCaseOutputType {
  type: 'FAILED_TO_MERGE';
  pullRequestData: PullRequestData;
}

export interface NoMergeNeededMergeMergeBackUseCaseOutput
  extends MergeBackUseCaseOutputType {
  type: 'NO_MERGE_NEEDED';
}

export interface NotMergeableMergeMergeBackUseCaseOutput
  extends MergeBackUseCaseOutputType {
  type: 'NOT_MERGEABLE';
  pullRequestData: PullRequestData;
}

export class GithubMergeBackUseCase implements MergeBackUseCase {
  private readonly pullRequestCreator: GithubPullRequestCreator;
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(
    owner: string,
    pullRequestCreator: GithubPullRequestCreator,
    githubService: GithubService
  ) {
    this.owner = owner;
    this.pullRequestCreator = pullRequestCreator;
    this.githubService = githubService;
  }

  execute(input: MergeBackUseCaseInput): Observable<MergeBackUseCaseOutput> {
    return this.githubService
      .compareCommits(this.owner, input.repository, input.head, input.base)
      .pipe(
        switchMap((response) => {
          if (response.ahead_by > 0) {
            return this.pullRequestCreator
              .create(
                `Merge back ${input.head} -> ${input.base}`,
                input.head,
                input.base,
                input.repository
              )
              .pipe(
                switchMap((pullRequestOutput) =>
                  this.githubService
                    .pullRequestData(
                      this.owner,
                      input.repository,
                      pullRequestOutput.pullRequestNumber
                    )
                    .pipe(
                      switchMap((pullRequestData) => {
                        if (pullRequestData.mergeable) {
                          return this.githubService
                            .merge(
                              this.owner,
                              input.repository,
                              pullRequestOutput.pullRequestNumber
                            )
                            .pipe(
                              switchMap((mergeResponse) => {
                                const merged = (mergeResponse as PullsMergeResponseData)
                                  .merged;
                                if (merged) {
                                  const result: SuccessMergeBackUseCaseOutput = {
                                    type: 'SUCCESS',
                                    pullRequestData: pullRequestData
                                  };
                                  return of(result);
                                }
                                const result: FailedToMergeMergeBackUseCaseOutput = {
                                  type: 'FAILED_TO_MERGE',
                                  pullRequestData: pullRequestData
                                };
                                return of(result);
                              })
                            );
                        }
                        const result: NotMergeableMergeMergeBackUseCaseOutput = {
                          type: 'NOT_MERGEABLE',
                          pullRequestData: pullRequestData
                        };
                        return of(result);
                      })
                    )
                )
              );
          }
          const result: NoMergeNeededMergeMergeBackUseCaseOutput = {
            type: 'NO_MERGE_NEEDED'
          };
          return of(result);
        })
      );
  }
}
