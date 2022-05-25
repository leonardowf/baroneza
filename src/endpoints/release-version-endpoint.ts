import { ReleaseVersionUseCase } from '../use-cases/release-version-use-case';
import { mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface ReleaseVersionEndpointInput {
  readonly tag: string;
  readonly projectKeys: string[];
  readonly jiraTagSuffix: string;
  readonly releaseDate?: string;
}

export class ReleaseVersionEndpointOutput {}

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
      .pipe(mapTo(new ReleaseVersionEndpointOutput()));
  }
}
