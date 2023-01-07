import { Observable, of, throwError } from 'rxjs';
import { PullRequestNumberExtractor } from '../workers/pr-number-extractor';
import { ReadPullRequestInfoUseCase } from './read-pull-request-info-use-case';
import { flatMap, map } from 'rxjs/operators';
import { KeepChangelogParser } from '../workers/keep-changelog-parser';
import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from '../workers/keep-changelog-builder/keep-changelog-builder';
import { Block } from '@slack/web-api';
import { CommitPRNumberParser } from '../workers/keep-changelog-builder/commits-pr-number-parser';

export type Origin = OriginCommits | OriginPullRequestNumber;
export interface OriginType {
  type: KnownOriginType;
}

export type KnownOriginType = 'pullRequestNumber' | 'commits';
export interface OriginPullRequestNumber extends OriginType {
  readonly type: 'pullRequestNumber';
  readonly number: number;
}

export interface OriginCommits extends OriginType {
  readonly type: 'commits';
  readonly commits: string[];
}

export type KnownChangelogType = 'markdown' | 'blocks';
export interface ChangelogType {
  readonly type: KnownChangelogType;
}
export interface BlockChangelog extends ChangelogType {
  readonly type: 'blocks';
  readonly content: Block[];
}

export interface MarkdownChangelog extends ChangelogType {
  readonly type: 'markdown';
  readonly content: string;
}

export interface CreateChangelogUseCase {
  execute(
    input: CreateChangelogInput
  ): Observable<CreateChangelogOutput | undefined>;
}

export class CreateChangelogInput {
  readonly origin: Origin;
  readonly repository: string;
  readonly version: string;

  constructor(origin: Origin, repository: string, version: string) {
    this.origin = origin;
    this.repository = repository;
    this.version = version;
  }
}
export interface CreateChangelogOutput {
  readonly blocks: BlockChangelog;
  readonly markdown: MarkdownChangelog;
}

export class GithubCreateChangelogUseCase implements CreateChangelogUseCase {
  private readonly blocksKeepChangelogBuilder: KeepChangelogBuilder<Block[]>;
  private readonly commitPRNumberParser: CommitPRNumberParser;
  private readonly keepChangelogParser: KeepChangelogParser;
  private readonly markdownKeepChangelogBuilder: KeepChangelogBuilder<string>;
  private readonly pullRequestInfoUseCase: ReadPullRequestInfoUseCase;
  private readonly pullRequestNumberExtractor: PullRequestNumberExtractor;

  constructor(
    blocksKeepChangelogBuilder: KeepChangelogBuilder<Block[]>,
    commitPRNumberParser: CommitPRNumberParser,
    keepChangelogBuilder: KeepChangelogBuilder<string>,
    keepChangelogParser: KeepChangelogParser,
    pullRequestInfoUseCase: ReadPullRequestInfoUseCase,
    pullRequestNumberExtractor: PullRequestNumberExtractor
  ) {
    this.blocksKeepChangelogBuilder = blocksKeepChangelogBuilder;
    this.commitPRNumberParser = commitPRNumberParser;
    this.keepChangelogParser = keepChangelogParser;
    this.markdownKeepChangelogBuilder = keepChangelogBuilder;
    this.pullRequestInfoUseCase = pullRequestInfoUseCase;
    this.pullRequestNumberExtractor = pullRequestNumberExtractor;
  }

  execute(
    input: CreateChangelogInput
  ): Observable<CreateChangelogOutput | undefined> {
    return this.pullRequestNumbers(input.origin, input.repository)
      .pipe(
        flatMap((numbers) => {
          if (numbers.length === 0) {
            return throwError(
              new Error('No pull requests to build a changelog')
            );
          }
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
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
                      pullRequest.pullRequest.identifier.toString(),
                      pullRequest.pullRequest.url,
                      pullRequest.pullRequest.authorImageUrl
                    )
                )
              );
            }
          });

          const blocks = this.blocksKeepChangelogBuilder.build(
            input.version,
            added,
            changed,
            deprecated,
            removed,
            fixed,
            security
          );
          const markdown = this.markdownKeepChangelogBuilder.build(
            input.version,
            added,
            changed,
            deprecated,
            removed,
            fixed,
            security
          );

          if (blocks === undefined) {
            return undefined;
          }

          if (markdown === undefined) {
            return undefined;
          }

          return {
            blocks: { type: 'blocks', content: blocks },
            markdown: { type: 'markdown', content: markdown }
          };
        })
      );
  }

  private pullRequestNumbers(
    origin: Origin,
    repository: string
  ): Observable<number[]> {
    if (origin.type === 'commits') {
      return of(this.commitPRNumberParser.parse(origin.commits));
    }
    return this.pullRequestNumberExtractor.extract(origin.number, repository);
  }
}
