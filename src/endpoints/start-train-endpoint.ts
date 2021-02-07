import { Observable } from 'rxjs';
import {
  StartTrainUseCase,
  StartTrainUseCaseInput
} from '../use-cases/start-train-use-case';
import { map } from 'rxjs/operators';

export interface StartTrainDependencies {
  readonly startTrainUseCase: StartTrainUseCase;
}

export interface StartTrainEndpointInput {
  repository: string;
  baseBranch: string;
  targetBranch: string;
  channel: string;
  jiraTagSuffix: string;
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
          input.jiraTagSuffix
        )
      )
      .pipe(map(() => new StartTrainEndpointOutput()));
  }
}
