import { Observable } from 'rxjs';
import { PullRequestNumberExtractor } from '../workers/pr-number-extractor';
import { ReadPullRequestInfoUseCase } from './read-pull-request-info-use-case';
import { flatMap, map } from 'rxjs/operators';
import { KeepChangelogParser } from '../workers/keep-changelog-parser';
import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from '../workers/keep-changelog-builder/keep-changelog-builder';
import { Block } from '@slack/web-api';

export type KnownChangelogType = 'markdown' | 'blocks';

export interface ChangelogType {
  readonly type: KnownChangelogType;
}

export interface BlockChangelog extends ChangelogType {
  type: 'blocks';
  content: Block[];
}

export interface MarkdownChangelog extends ChangelogType {
  type: 'markdown';
  content: string;
}

export interface CreateChangelogUseCase {
  execute(
    input: CreateChangelogInput
  ): Observable<CreateChangelogOutput | undefined>;
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

export interface CreateChangelogOutput {
  readonly blocks: BlockChangelog;
  readonly markdown: MarkdownChangelog;
}

export class GithubCreateChangelogUseCase implements CreateChangelogUseCase {
  private readonly pullRequestNumberExtractor: PullRequestNumberExtractor;
  private readonly pullRequestInfoUseCase: ReadPullRequestInfoUseCase;
  private readonly keepChangelogParser: KeepChangelogParser;
  private readonly markdownKeepChangelogBuilder: KeepChangelogBuilder<string>;
  private readonly blocksKeepChangelogBuilder: KeepChangelogBuilder<Block[]>;

  constructor(
    pullRequestNumberExtractor: PullRequestNumberExtractor,
    pullRequestInfoUseCase: ReadPullRequestInfoUseCase,
    keepChangelogParser: KeepChangelogParser,
    keepChangelogBuilder: KeepChangelogBuilder<string>,
    blocksKeepChangelogBuilder: KeepChangelogBuilder<Block[]>
  ) {
    this.pullRequestNumberExtractor = pullRequestNumberExtractor;
    this.pullRequestInfoUseCase = pullRequestInfoUseCase;
    this.keepChangelogParser = keepChangelogParser;
    this.markdownKeepChangelogBuilder = keepChangelogBuilder;
    this.blocksKeepChangelogBuilder = blocksKeepChangelogBuilder;
  }

  execute(
    input: CreateChangelogInput
  ): Observable<CreateChangelogOutput | undefined> {
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
}
