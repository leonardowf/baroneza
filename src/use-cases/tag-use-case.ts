import { Observable } from 'rxjs';
import {
  TagEndpointOutputMapper,
  TagEndpointInputMapper,
  TagEndpointResponse,
  TagEndpointInput
} from '../endpoints/tag-endpoint';
import { CommitExtractor, JiraTicketParser } from '../workers/commit-extractor';
import { map, flatMap } from 'rxjs/operators';
import { JiraTicketTagger } from '../workers/jira-tagger';

export interface TagUseCase {
  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>;
}

export class TagUseCaseInput {
  identifier: number;
  tag: string;

  constructor(identifier: number, tag: string) {
    this.identifier = identifier;
    this.tag = tag;
  }
}
export class TagUseCaseOutput {
  successes: string[];
  failures: string[];

  constructor(successes: string[], failures: string[]) {
    this.successes = successes;
    this.failures = failures;
  }
}

export interface JiraTagUseCaseDependencies {
  readonly commitExtractor: CommitExtractor;
  readonly jiraTicketParser: JiraTicketParser;
  readonly jiraTicketTagger: JiraTicketTagger;
}

export class JiraTagUseCase implements TagUseCase {
  commitExtractor: CommitExtractor;
  jiraTickerParser: JiraTicketParser;
  jiraTicketTagger: JiraTicketTagger;

  constructor(dependencies: JiraTagUseCaseDependencies) {
    this.commitExtractor = dependencies.commitExtractor;
    this.jiraTickerParser = dependencies.jiraTicketParser;
    this.jiraTicketTagger = dependencies.jiraTicketTagger;
  }

  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput> {
    return this.commitExtractor
      .commits(input.identifier)
      .pipe(map((commits) => this.jiraTickerParser.parse(commits)))
      .pipe(
        flatMap((ticketIds) => this.jiraTicketTagger.tag(ticketIds, input.tag))
      )
      .pipe(
        map((output) => new TagUseCaseOutput(output.successes, output.failures))
      );
  }
}

export class JiraMappers
  implements TagEndpointOutputMapper, TagEndpointInputMapper {
  map(useCaseOutput: TagUseCaseOutput): TagEndpointResponse {
    return new TagEndpointResponse(
      useCaseOutput.successes,
      useCaseOutput.failures
    );
  }

  mapToUseCase(tagEndpointInput: TagEndpointInput): TagUseCaseInput {
    return new TagUseCaseInput(tagEndpointInput.number, tagEndpointInput.tag);
  }
}
