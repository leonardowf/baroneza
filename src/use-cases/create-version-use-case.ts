import { Observable, from, of } from 'rxjs';
import { JiraService } from '../services/jira-service';
import { flatMap } from 'rxjs/operators';

export interface CreateVersionUseCase {
  execute(
    input: CreateVersionUseCaseInput
  ): Observable<CreateVersionUseCaseOutput>;
}

export class CreateVersionUseCaseInput {
  readonly project: string;
  readonly version: string;

  constructor(project: string, version: string) {
    this.project = project;
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
  ): Observable<CreateVersionUseCaseOutput> {
    const createVersion = this.jiraService
      .projectId(input.project)
      .pipe(
        flatMap((projectId) =>
          this.jiraService.createVersion(input.version, projectId)
        )
      );

    return this.jiraService.hasVersion(input.version, input.project).pipe(
      flatMap((x) => {
        if (!x) {
          return createVersion;
        }

        return of(new CreateVersionUseCaseOutput());
      })
    );
  }
}
