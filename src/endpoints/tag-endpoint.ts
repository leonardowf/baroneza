import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../use-cases/tag-use-case';

export interface TagEndpointDependencies {
  readonly tagUseCase: TagUseCase;
  project: string;
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
  private readonly project: string;

  constructor(dependencies: TagEndpointDependencies) {
    this.tagUseCase = dependencies.tagUseCase;
    this.project = dependencies.project;
  }

  execute(input: TagEndpointInput): Observable<TagEndpointResponse> {
    const useCaseInput = new TagUseCaseInput(
      input.number,
      input.tag,
      this.project,
      input.repository,
      input.jiraTagSuffix
    );

    return this.tagUseCase
      .execute(useCaseInput)
      .pipe(map((x) => new TagEndpointResponse(x.successes, x.failures)));
  }
}

export interface TagEndpointInput {
  readonly number: number;
  readonly tag: string;
  readonly repository: string;
  readonly jiraTagSuffix: string;
}
