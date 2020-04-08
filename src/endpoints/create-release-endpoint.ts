import { CreateReleaseUseCase } from '../use-cases/create-release-use-case';
import { mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface CreateReleaseEndpointInput {
  branchName: string;
  referenceBranch: string;
  name: string;
}

export class CreateReleaseEndpointResponse {}

export interface CreateReleaseEndpointDependencies {
  createReleaseUseCase: CreateReleaseUseCase;
}

export class CreateReleaseEndpoint {
  private createReleaseUseCase: CreateReleaseUseCase;

  constructor(dependencies: CreateReleaseEndpointDependencies) {
    this.createReleaseUseCase = dependencies.createReleaseUseCase;
  }

  execute(
    input: CreateReleaseEndpointInput
  ): Observable<CreateReleaseEndpointResponse> {
    return this.createReleaseUseCase
      .execute({
        branchName: input.branchName,
        referenceBranch: input.referenceBranch
      })
      .pipe(mapTo(new CreateReleaseEndpointResponse()));
  }
}
