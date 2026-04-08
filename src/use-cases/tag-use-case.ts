import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { log } from '../logger';
import { ShaWindow } from '../workers/commit-extractor';
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
  readonly identifier: number | ShaWindow;
  readonly tag: string;
  readonly projectKeys: string[];
  readonly repository: string;
  readonly jiraTagSuffix: string;
  readonly jiraTagDescription?: string;

  constructor(
    identifier: number | ShaWindow,
    tag: string,
    projectKeys: string[],
    repository: string,
    jiraTagSuffix: string,
    jiraTagDescription?: string
  ) {
    this.identifier = identifier;
    this.tag = tag;
    this.projectKeys = projectKeys;
    this.repository = repository;
    this.jiraTagSuffix = jiraTagSuffix;
    this.jiraTagDescription = jiraTagDescription;
  }
}

export class TagUseCaseOutput {
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
    log(`[TagUseCase] starting for tag="${input.tag}${input.jiraTagSuffix}" repository="${input.repository}" projectKeys=${JSON.stringify(input.projectKeys)}`);
    return this.extractTicketsUseCase
      .execute({
        reference: input.identifier,
        repository: input.repository
      })
      .pipe(
        flatMap((extractTicketsOutput) => {
          const tag = `${input.tag}${input.jiraTagSuffix}`;
          log(`[TagUseCase] creating Jira version "${tag}" for ${input.projectKeys.length} project keys`);
          return this.createVersionUseCase
            .execute(
              new CreateVersionUseCaseInput(
                input.projectKeys,
                tag,
                input.jiraTagDescription
              )
            )
            .pipe(
              flatMap((createVersionUseCaseOutput) =>
                this.jiraTicketTagger
                  .tag(
                    extractTicketsOutput.ticketIdsCommits.map(
                      (x) => x.ticketId
                    ),
                    tag
                  )
                  .pipe(
                    map((jiraTicketTaggetOutput) => {
                      return {
                        createVersionUseCaseOutput,
                        jiraTicketTaggetOutput
                      };
                    })
                  )
              )
            );
        })
      )
      .pipe(
        map((output) => {
          const successes = output.jiraTicketTaggetOutput.successes;
          const failures = output.jiraTicketTaggetOutput.failures;
          const failuresOnProjectKeys = output.createVersionUseCaseOutput
            .filter((x) => x.resultPerProjectKey.result === 'FAILED')
            .map((x) => x.resultPerProjectKey.projectKey);
          log(`[TagUseCase] done — successes=${successes.length} failures=${failures.length} failedProjectKeys=${JSON.stringify(failuresOnProjectKeys)}`);
          return new TagUseCaseOutput(successes, failures, failuresOnProjectKeys);
        })
      );
  }
}
