import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mapTo } from 'rxjs/operators';
import { JiraService } from '../services/jira-service';

export type ReleaseVersionUseCaseInput = {
  readonly projectKeys: string[];
  readonly version: string;
  readonly releaseDate?: string;
};

export class ReleaseVersionUseCaseOutput {
  readonly result: ResultPerProjectKey[];
  constructor(result: ResultPerProjectKey[]) {
    this.result = result;
  }
}

type ResultPerProjectKey = {
  readonly projectKey: string;
  readonly result: 'RELEASED' | 'FAILED';
};

export interface ReleaseVersionUseCase {
  execute(
    input: ReleaseVersionUseCaseInput
  ): Observable<ReleaseVersionUseCaseOutput>;
}

export class ConcreteReleaseVersionUseCase {
  constructor(readonly jiraService: JiraService) {}

  execute(
    input: ReleaseVersionUseCaseInput
  ): Observable<ReleaseVersionUseCaseOutput> {
    const releaseVersions = input.projectKeys.map((projectKey) => {
      return this.releaseVersion(projectKey, input.version, input.releaseDate);
    });
    return forkJoin(releaseVersions).pipe(
      map((x) => new ReleaseVersionUseCaseOutput(x))
    );
  }

  private releaseVersion(
    projectKey: string,
    version: string,
    releaseDate?: string
  ): Observable<ResultPerProjectKey> {
    return this.jiraService
      .releaseVersion(version, projectKey, releaseDate)
      .pipe(mapTo({ projectKey, result: 'RELEASED' } as ResultPerProjectKey))
      .pipe(
        catchError(() =>
          of<ResultPerProjectKey>({ projectKey, result: 'FAILED' })
        )
      );
  }
}
