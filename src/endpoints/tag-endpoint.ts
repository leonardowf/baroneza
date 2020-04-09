import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../use-cases/tag-use-case';

export interface TagEndpointDependencies {
  tagUseCase: TagUseCase;
  inputMapper: TagEndpointInputMapper;
  outputMapper: TagEndpointOutputMapper;
}

export interface TagEndpointInputMapper {
  mapToUseCase(input: TagEndpointInput): TagUseCaseInput;
}

export interface TagEndpointOutputMapper {
  map(useCaseOutput: TagUseCaseOutput): TagEndpointResponse;
}

export class TagEndpoint {
  tagUseCase: TagUseCase;
  inputMapper: TagEndpointInputMapper;
  outputMapper: TagEndpointOutputMapper;

  constructor(dependencies: TagEndpointDependencies) {
    this.tagUseCase = dependencies.tagUseCase;
    this.inputMapper = dependencies.inputMapper;
    this.outputMapper = dependencies.outputMapper;
  }

  execute(input: TagEndpointInput): Observable<TagEndpointResponse> {
    const useCaseInput = this.inputMapper.mapToUseCase(input);
    return this.tagUseCase
      .execute(useCaseInput)
      .pipe(map((x) => this.outputMapper.map(x)));
  }
}

export interface TagEndpointInput {
  number: number;
  tag: string;
}

export class TagEndpointResponse {
  successes: string[];
  failures: string[];

  constructor(successes: string[], failures: string[]) {
    this.successes = successes;
    this.failures = failures;
  }
}
