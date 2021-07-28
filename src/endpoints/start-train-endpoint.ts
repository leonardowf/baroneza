import { Observable } from 'rxjs';
import {
  StartTrainUseCase,
  StartTrainUseCaseInput
} from '../use-cases/start-train-use-case';
import { map } from 'rxjs/operators';
import { ReleaseType } from '../workers/next-release-guesser';

export interface StartTrainDependencies {
  readonly startTrainUseCase: StartTrainUseCase;
}

export interface StartTrainEndpointInput {
  repository: string;
  baseBranch: string;
  targetBranch: string;
  channel: string;
  jiraTagSuffix: string;
  releaseType: ReleaseType;
}

export class StartTrainEndpointOutput {}

export class StartTrainEndpoint {
  private startTrainUseCase: StartTrainUseCase;

  constructor(dependencies: StartTrainDependencies) {
    this.startTrainUseCase = dependencies.startTrainUseCase;
  }

  execute(
    input: StartTrainEndpointInput
  ): Observable<StartTrainEndpointOutput> {
    return this.startTrainUseCase
      .execute(
        new StartTrainUseCaseInput(
          input.repository,
          input.baseBranch,
          input.targetBranch,
          input.channel,
          input.jiraTagSuffix,
          input.releaseType
        )
      )
      .pipe(map(() => new StartTrainEndpointOutput()));
  }
}
