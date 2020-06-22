import { Observable } from 'rxjs';
import { StartTrainUseCase } from '../use-cases/start-train-use-case';
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

  execute(): Observable<StartTrainOutput> {
    return this.startTrainUseCase
      .execute()
      .pipe(map(() => new StartTrainOutput()));
  }
}
