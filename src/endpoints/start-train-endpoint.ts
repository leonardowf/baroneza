import { Observable, of } from 'rxjs';
import {
  StartTrainUseCase,
  StartTrainUseCaseInput
} from '../use-cases/start-train-use-case';
import { map } from 'rxjs/operators';

export interface StartTrainDependencies {
  startTrainUseCase: StartTrainUseCase;
}

export class StartTrainInput {}

export class StartTrainOutput {}

export class StartTrainEndpoint {
  private startTrainUseCase: StartTrainUseCase;

  constructor(dependencies: StartTrainDependencies) {
    this.startTrainUseCase = dependencies.startTrainUseCase;
  }

  execute(input: StartTrainInput): Observable<StartTrainOutput> {
    return this.startTrainUseCase
      .execute(new StartTrainUseCaseInput())
      .pipe(map((x) => new StartTrainOutput()));
  }
}
