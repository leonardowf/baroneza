import { ReleaseVersionUseCase } from '../use-cases/release-version-use-case';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface ReleaseVersionEndpointInput {
  readonly tag: string;
  readonly projectKeys: string[];
  readonly jiraTagSuffix: string;
  readonly releaseDate?: string;
}

export type ReleaseVersionEndpointOutput = {
  failures: string[];
  successes: string[];
};

export interface ReleaseVersionEndpointDependencies {
  releaseVersionUseCase: ReleaseVersionUseCase;
}

export class ReleaseVersionEndpoint {
  private releaseVersionUseCase: ReleaseVersionUseCase;

  constructor(dependencies: ReleaseVersionEndpointDependencies) {
    this.releaseVersionUseCase = dependencies.releaseVersionUseCase;
  }

  execute(
    input: ReleaseVersionEndpointInput
  ): Observable<ReleaseVersionEndpointOutput> {
    return this.releaseVersionUseCase
      .execute({
        projectKeys: input.projectKeys,
        version: `${input.tag}${input.jiraTagSuffix}`,
        releaseDate: input.releaseDate
      })
      .pipe(
        map((x) => {
          const failures = x.result
            .filter((x) => x.result === 'FAILED')
            .map((x) => x.projectKey);
          const successes = x.result
            .filter((x) => x.result === 'RELEASED')
            .map((x) => x.projectKey);
          return { failures, successes };
        }),
        catchError((error) => {
          console.log(error);
          return throwError({
            message: error.message ?? 'Unable to release version'
          });
        })
      );
  }
}
