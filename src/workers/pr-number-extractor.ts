import { Observable } from 'rxjs';
import { CommitExtractor } from './commit-extractor';
import { map } from 'rxjs/operators';
import { CommitPRNumberParser } from './keep-changelog-builder/commits-pr-number-parser';
export interface PullRequestNumberExtractor {
  extract(pullNumber: number, repository: string): Observable<number[]>;
}

export class GithubPullRequestNumberExtractor
  implements PullRequestNumberExtractor {
  private readonly commitExtractor: CommitExtractor;
  private readonly commitPRNumberParser: CommitPRNumberParser;

  constructor(commitExtractor: CommitExtractor, commitPRNumberParser: CommitPRNumberParser) {
    this.commitExtractor = commitExtractor;
    this.commitPRNumberParser = commitPRNumberParser;
  }

  extract(pullNumber: number, repository: string): Observable<number[]> {
    return this.commitExtractor.commits(pullNumber, repository).pipe(
      map(this.commitPRNumberParser.parse)
    );
  }
}
