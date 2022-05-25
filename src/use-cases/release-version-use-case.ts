import { forkJoin, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { JiraService } from '../services/jira-service';

export class ReleaseVersionUseCaseInput {
  constructor(
    readonly projectKeys: string[],
    readonly version: string,
    readonly releaseDate?: string
  ) {}
}

export class ReleaseVersionUseCaseOutput {}

export class ReleaseVersionUseCase {
  constructor(readonly jiraService: JiraService) {}

  execute(
    input: ReleaseVersionUseCaseInput
  ): Observable<ReleaseVersionUseCaseOutput[]> {
    const releaseVersions = input.projectKeys.map((projectKey) => {
      return this.releaseVersion(projectKey, input.version, input.releaseDate);
    });
    return forkJoin(releaseVersions);
  }

  private releaseVersion(
    projectKey: string,
    version: string,
    releaseDate?: string
  ): Observable<ReleaseVersionUseCaseOutput> {
    return this.jiraService
      .releaseVersion(version, projectKey, releaseDate)
      .pipe(mapTo(new ReleaseVersionUseCaseOutput()));
  }
}
