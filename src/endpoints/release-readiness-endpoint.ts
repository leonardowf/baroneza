import { Observable, throwError } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import {
  ReleaseReadinessInput,
  ReleaseReadinessOutput,
  ReleaseReadinessUseCase
} from '../use-cases/release-readiness-use-case';

export interface ReleaseReadinessEndpointDependencies {
  readonly releaseReadinessUseCase: ReleaseReadinessUseCase;
}

export type ReleaseReadinessEndpointInput = {
  readonly channel: string;
  readonly baseBranch: string;
  readonly repository: string;
  readonly targetBranch: string;
  readonly branchPrefix: string;
  readonly projectKeys: string[];

  readonly pullRequestTitlePrefix: string;
  readonly releaseType: string;
  readonly qaPlanFieldId: string;
};

export class ReleaseReadinessEndpoint {
  private readonly releaseReadinessUseCase: ReleaseReadinessUseCase;

  constructor(dependencies: ReleaseReadinessEndpointDependencies) {
    this.releaseReadinessUseCase = dependencies.releaseReadinessUseCase;
  }

  execute(
    input: ReleaseReadinessEndpointInput
  ): Observable<ReleaseReadinessOutput> {
    return this.releaseReadinessUseCase
      .execute(input as ReleaseReadinessInput)
      .pipe(
        mapTo({}),
        catchError((error) =>
          throwError(error.message ?? 'Unable to post release readiness')
        )
      );
  }
}
