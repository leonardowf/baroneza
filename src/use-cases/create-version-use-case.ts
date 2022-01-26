import { Observable, of } from 'rxjs';
import { JiraService } from '../services/jira-service';
import { flatMap, mapTo } from 'rxjs/operators';
import { forkJoin } from 'rxjs'

export interface CreateVersionUseCase {
  execute(
    input: CreateVersionUseCaseInput
  ): Observable<CreateVersionUseCaseOutput>;
}

export class CreateVersionUseCaseInput {
  readonly projectKeys: string[];
  readonly version: string;

  constructor(projectKeys: string[], version: string) {
    this.projectKeys = projectKeys;
    this.version = version;
  }
}

export class CreateVersionUseCaseOutput {}

export class JiraCreateVersionUseCase implements CreateVersionUseCase {
  private readonly jiraService: JiraService;

  constructor(jiraService: JiraService) {
    this.jiraService = jiraService;
  }

  execute(
    input: CreateVersionUseCaseInput
  ): Observable<CreateVersionUseCaseOutput[]> {
     const createdVersions = input.projectKeys.map((projectKey) => {
      return this.createVersion(projectKey, input.version)
     });
     return forkJoin(createdVersions)
  }

  private createVersion(projectKey: string, version: string): Observable<CreateVersionUseCaseOutput> {
    const createVersion = this.jiraService
      .projectIdFromKey(projectKey)
      .pipe(
        flatMap((projectId) =>
          this.jiraService.createVersion(version, projectId)
        )
      )
      .pipe(mapTo(new CreateVersionUseCaseOutput()));

    return this.jiraService.hasVersion(version, projectKey).pipe(
      flatMap((x) => {
        if (!x) {
          return createVersion;
        }

        return of(new CreateVersionUseCaseOutput());
      })
    );
  }
}
