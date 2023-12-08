import { Observable } from 'rxjs';
import {
  ExtractTicketsInput,
  ExtractTicketsOutput,
  ExtractTicketsUseCase
} from '../use-cases/extract-tickets-use-case';

export type ExtractTicketsEndpointDependencies = {
  readonly extractTicketsUseCase: ExtractTicketsUseCase;
};

export class ExtractTicketsEndpoint {
  private readonly extractTicketsUseCase: ExtractTicketsUseCase;

  constructor(dependencies: ExtractTicketsEndpointDependencies) {
    this.extractTicketsUseCase = dependencies.extractTicketsUseCase;
  }
  execute(input: ExtractTicketsInput): Observable<ExtractTicketsOutput> {
    return this.extractTicketsUseCase.execute(input);
  }
}
