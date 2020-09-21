import { GithubService } from '../services/github-service';
import { flatMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export interface MilestoneCreator {
  create(title: string, repo: string): Observable<number>;
}

export class GithubMilestoneCreator {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  create(title: string, repo: string): Observable<number> {
    return this.githubService.getMilestone(this.owner, repo, title).pipe(
      flatMap((milestoneId) => {
        if (milestoneId === undefined) {
          return this.githubService.createMilestone(this.owner, repo, title);
        }

        return of(milestoneId);
      })
    );
  }
}
