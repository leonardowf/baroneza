import { GithubService } from '../services/github-service';
import { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

export interface ReleasePageCreator {
  create(
    tag: string,
    name: string,
    repo: string,
    changelog?: string
  ): Observable<void>;
}

export class GithubReleasePageCreator implements ReleasePageCreator {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  create(
    tag: string,
    name: string,
    repo: string,
    changelog?: string
  ): Observable<void> {
    return this.githubService
      .createPreRelease(tag, name, this.owner, repo, changelog)
      .pipe(mapTo(void 0));
  }
}
