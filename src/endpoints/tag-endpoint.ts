import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../use-cases/tag-use-case';
import { ShaWindow } from '../workers/commit-extractor';

export interface TagEndpointInput {
  readonly jiraTagSuffix: string;
  readonly reference: number | ShaWindow;
  readonly projectKeys: string[];
  readonly repository: string;
  readonly tag: string;
}

export interface TagEndpointDependencies {
  readonly tagUseCase: TagUseCase;
}

export interface TagEndpointInputMapper {
  mapToUseCase(input: TagEndpointInput): TagUseCaseInput;
}

export class TagEndpointResponse {
  successes: string[];
  failures: string[];
  failuresOnProjectKeys: string[];

  constructor(
    successes: string[],
    failures: string[],
    failuresOnProjectKeys: string[]
  ) {
    this.successes = successes;
    this.failures = failures;
    this.failuresOnProjectKeys = failuresOnProjectKeys;
  }
}

export interface TagEndpointOutputMapper {
  map(useCaseOutput: TagUseCaseOutput): TagEndpointResponse;
}

export class TagEndpoint {
  private readonly tagUseCase: TagUseCase;

  constructor(dependencies: TagEndpointDependencies) {
    this.tagUseCase = dependencies.tagUseCase;
  }

  execute(input: TagEndpointInput): Observable<TagEndpointResponse> {
    const useCaseInput = new TagUseCaseInput(
      input.reference,
      input.tag,
      input.projectKeys,
      input.repository,
      input.jiraTagSuffix
    );

    return this.tagUseCase.execute(useCaseInput).pipe(
      map(
        (x) =>
          new TagEndpointResponse(
            x.successes,
            x.failures,
            x.failuresOnProjectKeys
          )
      ),
      catchError((error) => {
        console.log(error);
        return throwError({
          message: error.message ?? 'Unable to tag release'
        });
      })
    );
  }
}
