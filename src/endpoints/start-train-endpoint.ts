import { Observable } from 'rxjs';
import { StartTrainUseCase } from '../use-cases/start-train-use-case';
import { map } from 'rxjs/operators';
import { ReleaseType } from '../workers/next-release-guesser';

export interface StartTrainDependencies {
  readonly startTrainUseCase: StartTrainUseCase;
}

export type StartTrainEndpointInput = {
  baseBranch: string;
  branchPrefix: string;
  channel: string;
  project: string | string[];
  jiraTagSuffix: string;
  pullRequestTitlePrefix: string;
  releaseType: ReleaseType;
  repository: string;
  targetBranch: string;
};

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
      .execute({
        ...input,
        project:
          typeof input.project === 'string' ? [input.project] : input.project
      })
      .pipe(map(() => new StartTrainEndpointOutput()));
  }
}
