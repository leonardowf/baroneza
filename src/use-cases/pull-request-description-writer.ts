import { Observable } from 'rxjs';
import { GithubService } from '../services/github-service';

export interface PullRequestDescriptionWriter {
  write(identifier: number, repository: string, body: string): Observable<void>;
}

export class GithubPullRequestDescriptionWriter
  implements PullRequestDescriptionWriter {
  private readonly githubService: GithubService;
  private readonly owner: string;
  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  write(
    identifier: number,
    repository: string,
    body: string
  ): Observable<void> {
    return this.githubService.updateDescription(
      identifier,
      this.owner,
      repository,
      body
    );
  }
}
