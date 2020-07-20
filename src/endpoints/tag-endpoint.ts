import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../use-cases/tag-use-case';

export interface TagEndpointDependencies {
  readonly tagUseCase: TagUseCase;
}

export interface TagEndpointInputMapper {
  mapToUseCase(input: TagEndpointInput): TagUseCaseInput;
}

export interface TagEndpointOutputMapper {
  map(useCaseOutput: TagUseCaseOutput): TagEndpointResponse;
}

export class TagEndpoint {
  tagUseCase: TagUseCase;

  constructor(dependencies: TagEndpointDependencies) {
    this.tagUseCase = dependencies.tagUseCase;
  }

  execute(input: TagEndpointInput): Observable<TagEndpointResponse> {
    const useCaseInput = new TagUseCaseInput(input.number, input.tag);
    return this.tagUseCase
      .execute(useCaseInput)
      .pipe(map((x) => new TagEndpointResponse(x.successes, x.failures)));
  }
}

export interface TagEndpointInput {
  readonly number: number;
  readonly tag: string;
}

export class TagEndpointResponse {
  successes: string[];
  failures: string[];

  constructor(successes: string[], failures: string[]) {
    this.successes = successes;
    this.failures = failures;
  }
}
