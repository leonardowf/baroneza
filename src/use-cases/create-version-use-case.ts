import { Observable, of } from 'rxjs';
import { JiraService } from '../services/jira-service';
import { catchError, flatMap, mapTo } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export interface CreateVersionUseCase {
  execute(
    input: CreateVersionUseCaseInput
  ): Observable<CreateVersionUseCaseOutput[]>;
}

export class CreateVersionUseCaseInput {
  readonly projectKeys: string[];
  readonly version: string;
  readonly description?: string;

  constructor(projectKeys: string[], version: string, description?: string) {
    this.projectKeys = projectKeys;
    this.version = version;
    this.description = description;
  }
}

type ResultPerProjectKey = {
  readonly projectKey: string;
  readonly result: 'CREATED' | 'EXISTED' | 'FAILED';
};

export class CreateVersionUseCaseOutput {
  readonly resultPerProjectKey: ResultPerProjectKey;

  constructor(resultPerProjectKey: ResultPerProjectKey) {
    this.resultPerProjectKey = resultPerProjectKey;
  }
}

export class JiraCreateVersionUseCase implements CreateVersionUseCase {
  private readonly jiraService: JiraService;

  constructor(jiraService: JiraService) {
    this.jiraService = jiraService;
  }

  execute(
    input: CreateVersionUseCaseInput
  ): Observable<CreateVersionUseCaseOutput[]> {
    const createdVersions = input.projectKeys.map((projectKey) => {
      return this.createVersion(projectKey, input.version, input.description);
    });
    return forkJoin(createdVersions);
  }

  private createVersion(
    projectKey: string,
    version: string,
    description?: string
  ): Observable<CreateVersionUseCaseOutput> {
    const createVersion = this.jiraService
      .projectIdFromKey(projectKey)
      .pipe(
        flatMap((projectId) =>
          this.jiraService.createVersion(version, projectId, description)
        )
      )
      .pipe(
        mapTo(new CreateVersionUseCaseOutput({ projectKey, result: 'CREATED' }))
      );

    return this.jiraService.hasVersion(version, projectKey).pipe(
      catchError((err) => {
        return of(err);
      }),

      flatMap((x) => {
        if (x instanceof Error) {
          return of(
            new CreateVersionUseCaseOutput({
              projectKey: projectKey,
              result: 'FAILED'
            })
          );
        } else if (!x) {
          return createVersion;
        }

        return of(
          new CreateVersionUseCaseOutput({ projectKey, result: 'EXISTED' })
        );
      })
    );
  }
}
