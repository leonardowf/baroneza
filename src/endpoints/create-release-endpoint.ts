import { CreateReleaseUseCase } from '../use-cases/create-release-use-case';
import { mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface CreateReleaseEndpointInput {
  readonly branchName: string;
  readonly referenceBranch: string;
  readonly title: string;
  readonly targetBranch: string;
  readonly projectTag: string;
  readonly project: string | string[];
  readonly repository: string;
  readonly channel: string;
  readonly jiraTagSuffix: string;
}

export class CreateReleaseEndpointOutput {}

export interface CreateReleaseEndpointDependencies {
  createReleaseUseCase: CreateReleaseUseCase;
}

export class CreateReleaseEndpoint {
  private createReleaseUseCase: CreateReleaseUseCase;

  constructor(dependencies: CreateReleaseEndpointDependencies) {
    this.createReleaseUseCase = dependencies.createReleaseUseCase;
  }

  execute(
    input: CreateReleaseEndpointInput
  ): Observable<CreateReleaseEndpointOutput> {
    return this.createReleaseUseCase
      .execute({
        branchName: input.branchName,
        referenceBranch: input.referenceBranch,
        title: input.title,
        targetBranch: input.targetBranch,
        projectTag: input.projectTag,
        project:
          typeof input.project === 'string' ? [input.project] : input.project,
        repository: input.repository,
        channel: input.channel,
        jiraTagSuffix: input.jiraTagSuffix
      })
      .pipe(mapTo(new CreateReleaseEndpointOutput()));
  }
}
