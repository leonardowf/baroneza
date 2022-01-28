import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { JiraTicketTagger } from '../workers/jira-tagger';
import {
  CreateVersionUseCase,
  CreateVersionUseCaseInput
} from './create-version-use-case';
import { ExtractTicketsUseCase } from './extract-tickets-use-case';

export interface TagUseCase {
  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>;
}

export class TagUseCaseInput {
  readonly identifier: number;
  readonly tag: string;
  readonly projectKeys: string[];
  readonly repository: string;
  readonly jiraTagSuffix: string;

  constructor(
    identifier: number,
    tag: string,
    projectKeys: string[],
    repository: string,
    jiraTagSuffix: string
  ) {
    this.identifier = identifier;
    this.tag = tag;
    this.projectKeys = projectKeys;
    this.repository = repository;
    this.jiraTagSuffix = jiraTagSuffix;
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
export class JiraTagUseCase implements TagUseCase {
  private readonly extractTicketsUseCase: ExtractTicketsUseCase;
  private readonly jiraTicketTagger: JiraTicketTagger;
  private readonly createVersionUseCase: CreateVersionUseCase;

  constructor(
    extractTicketsUseCase: ExtractTicketsUseCase,
    jiraTicketTagger: JiraTicketTagger,
    createVersionUseCase: CreateVersionUseCase
  ) {
    this.extractTicketsUseCase = extractTicketsUseCase;
    this.jiraTicketTagger = jiraTicketTagger;
    this.createVersionUseCase = createVersionUseCase;
  }

  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput> {
    return this.extractTicketsUseCase
      .execute({
        pullRequestNumber: input.identifier,
        repository: input.repository
      })
      .pipe(
        flatMap((extractTicketsOutput) => {
          const tag = `${input.tag}${input.jiraTagSuffix}`;
          return this.createVersionUseCase
            .execute(new CreateVersionUseCaseInput(input.projectKeys, tag))
            .pipe(
              flatMap(() =>
                this.jiraTicketTagger.tag(
                  extractTicketsOutput.ticketIdsCommits.map((x) => x.ticketId),
                  tag
                )
              )
            );
        })
      )
      .pipe(
        map((output) => new TagUseCaseOutput(output.successes, output.failures))
      );
  }
}
