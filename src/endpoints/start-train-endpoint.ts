import { Observable, throwError } from 'rxjs';
import { StartTrainUseCase } from '../use-cases/start-train-use-case';
import { catchError, map } from 'rxjs/operators';
import { ReleaseType } from '../workers/next-release-guesser';

export interface StartTrainEndpointDependencies {
  readonly startTrainUseCase: StartTrainUseCase;
}

export type StartTrainEndpointInput = {
  baseBranch: string;
  branchPrefix: string;
  channel: string;
  projectKeys: string[];
  jiraTagSuffix: string;
  pullRequestTitlePrefix: string;
  releaseType: ReleaseType;
  repository: string;
  targetBranch: string;
};

export class StartTrainEndpointOutput {}

export class StartTrainEndpoint {
  private startTrainUseCase: StartTrainUseCase;

  constructor(dependencies: StartTrainEndpointDependencies) {
    this.startTrainUseCase = dependencies.startTrainUseCase;
  }

  execute(
    input: StartTrainEndpointInput
  ): Observable<StartTrainEndpointOutput> {
    return this.startTrainUseCase.execute(input).pipe(
      map(() => new StartTrainEndpointOutput()),
      catchError((error) => {
        return throwError({
          message: error.message ?? 'Unable to start train'
        });
      })
    );
  }
}
