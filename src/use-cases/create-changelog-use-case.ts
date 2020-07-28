import { Observable } from 'rxjs';
import { PullRequestNumberExtractor } from '../workers/pr-number-extractor';
import { ReadPullRequestInfoUseCase } from './read-pull-request-info-use-case';
import { flatMap, map } from 'rxjs/operators';
import { KeepChangelogParser } from '../workers/keep-changelog-parser';
import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from '../workers/keep-changelog-builder';

export interface CreateChangelogUseCase {
  execute(input: CreateChangelogInput): Observable<string | undefined>;
}

export class CreateChangelogInput {
  readonly pullRequestNumber: number;
  readonly repository: string;
  readonly version: string;

  constructor(pullRequestNumber: number, repository: string, version: string) {
    this.pullRequestNumber = pullRequestNumber;
    this.repository = repository;
    this.version = version;
  }
}

export class CreateChangelogOutput {}

export class GithubCreateChangelogUseCase
  implements CreateChangelogUseCase {
  private readonly pullRequestNumberExtractor: PullRequestNumberExtractor;
  private readonly pullRequestInfoUseCase: ReadPullRequestInfoUseCase;
  private readonly keepChangelogParser: KeepChangelogParser;
  private readonly keepChangelogBuilder: KeepChangelogBuilder;

  constructor(
    pullRequestNumberExtractor: PullRequestNumberExtractor,
    pullRequestInfoUseCase: ReadPullRequestInfoUseCase,
    keepChangelogParser: KeepChangelogParser,
    keepChangelogBuilder: KeepChangelogBuilder
  ) {
    this.pullRequestNumberExtractor = pullRequestNumberExtractor;
    this.pullRequestInfoUseCase = pullRequestInfoUseCase;
    this.keepChangelogParser = keepChangelogParser;
    this.keepChangelogBuilder = keepChangelogBuilder;
  }

  execute(input: CreateChangelogInput): Observable<string | undefined> {
    return this.pullRequestNumberExtractor
      .extract(input.pullRequestNumber, input.repository)
      .pipe(
        flatMap((numbers) => {
          return this.pullRequestInfoUseCase.execute(numbers, input.repository);
        })
      )
      .pipe(
        map((x) => {
          return x.pullRequests.map((pullRequest) => {
            const parsed = this.keepChangelogParser.parse(
              pullRequest.description
            );
            return { parsed, pullRequest };
          });
        })
      )
      .pipe(
        map((pullRequests) => {
          let added: KeepChangelogItem[] = [];
          let changed: KeepChangelogItem[] = [];
          let deprecated: KeepChangelogItem[] = [];
          let fixed: KeepChangelogItem[] = [];
          let removed: KeepChangelogItem[] = [];
          let security: KeepChangelogItem[] = [];

          pullRequests.forEach((pullRequest) => {
            if (pullRequest.parsed !== null) {
              added = added.concat(
                pullRequest.parsed.added.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
              changed = changed.concat(
                pullRequest.parsed.changed.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
              deprecated = deprecated.concat(
                pullRequest.parsed.deprecated.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
              fixed = fixed.concat(
                pullRequest.parsed.fixed.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
              removed = removed.concat(
                pullRequest.parsed.removed.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
              security = security.concat(
                pullRequest.parsed.security.map(
                  (a) =>
                    new KeepChangelogItem(
                      a,
                      pullRequest.pullRequest.author,
                      pullRequest.pullRequest.date,
                      pullRequest.pullRequest.identifier.toString()
                    )
                )
              );
            }
          });

          return this.keepChangelogBuilder.build(
            input.version,
            added,
            changed,
            deprecated,
            removed,
            fixed,
            security
          );
        })
      );
  }
}
