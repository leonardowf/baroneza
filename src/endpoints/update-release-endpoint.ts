import { Observable, throwError } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { UpdateReleaseUseCase } from '../use-cases/update-release-use-case';

export interface UpdateReleaseEndpointDependencies {
  readonly updateReleaseUseCase: UpdateReleaseUseCase;
}

export type UpdateReleaseEndpointInput = {
  readonly channel: string;
  readonly fromVersion: string;
  readonly jiraSuffix: string;
  readonly projectKeys: string[];
  readonly pullRequestNumber: number;
  readonly repository: string;
  readonly title: string;
  readonly toVersion: string;
};

export type UpdateReleaseEndpointOutput = {};

export class UpdateReleaseEndpoint {
  private readonly updateReleaseUseCase: UpdateReleaseUseCase;

  constructor(dependencies: UpdateReleaseEndpointDependencies) {
    this.updateReleaseUseCase = dependencies.updateReleaseUseCase;
  }

  execute(
    input: UpdateReleaseEndpointInput
  ): Observable<UpdateReleaseEndpointOutput> {
    return this.updateReleaseUseCase.execute(input).pipe(
      mapTo({}),
      catchError((error) => {
        console.log(error);
        return throwError(error.message ?? 'Unable to update release');
      })
    );
  }
}
