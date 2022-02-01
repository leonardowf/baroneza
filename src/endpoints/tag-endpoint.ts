import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../use-cases/tag-use-case';

export interface TagEndpointInput {
  readonly jiraTagSuffix: string;
  readonly reference: number | string;
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

  constructor(successes: string[], failures: string[]) {
    this.successes = successes;
    this.failures = failures;
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

    return this.tagUseCase
      .execute(useCaseInput)
      .pipe(map((x) => new TagEndpointResponse(x.successes, x.failures)));
  }
}
