import { Observable } from 'rxjs';
import { CommitExtractor } from '../workers/commit-extractor';
import { map, flatMap } from 'rxjs/operators';
import { JiraTicketTagger } from '../workers/jira-tagger';
import { JiraTicketParser } from '../workers/jira-ticket-parser';
import {
  CreateVersionUseCase,
  CreateVersionUseCaseInput
} from './create-version-use-case';

export interface TagUseCase {
  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>;
}

export class TagUseCaseInput {
  readonly identifier: number;
  readonly tag: string;
  readonly project: string;
  readonly repository: string;

  constructor(
    identifier: number,
    tag: string,
    project: string,
    repository: string
  ) {
    this.identifier = identifier;
    this.tag = tag;
    this.project = project;
    this.repository = repository;
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
  readonly createVersionUseCase: CreateVersionUseCase;
}

export class JiraTagUseCase implements TagUseCase {
  private readonly commitExtractor: CommitExtractor;
  private readonly jiraTickerParser: JiraTicketParser;
  private readonly jiraTicketTagger: JiraTicketTagger;
  private readonly createVersionUseCase: CreateVersionUseCase;

  constructor(dependencies: JiraTagUseCaseDependencies) {
    this.commitExtractor = dependencies.commitExtractor;
    this.jiraTickerParser = dependencies.jiraTicketParser;
    this.jiraTicketTagger = dependencies.jiraTicketTagger;
    this.createVersionUseCase = dependencies.createVersionUseCase;
  }

  execute(input: TagUseCaseInput): Observable<TagUseCaseOutput> {
    return this.commitExtractor
      .commits(input.identifier, input.repository)
      .pipe(map((commits) => this.jiraTickerParser.parse(commits)))
      .pipe(
        flatMap((ticketIds) => {
          return this.createVersionUseCase
            .execute(new CreateVersionUseCaseInput(input.project, input.tag))
            .pipe(
              flatMap(() => this.jiraTicketTagger.tag(ticketIds, input.tag))
            );
        })
      )
      .pipe(
        map((output) => new TagUseCaseOutput(output.successes, output.failures))
      );
  }
}
