import { Observable } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo, flatMap } from 'rxjs/operators';
import { PullRequestCreator } from '../repositories/pull-request-creator';

export class CreateReleaseUseCaseInput {
  branchName: string;
  referenceBranch: string;
  targetBranch: string;
  title: string;
}

export class CreateReleaseUseCaseOutput {}

export class CreateReleaseUseCase {
  private createBranchUseCase: CreateBranchUseCase;
  private pullRequestCreator: PullRequestCreator

  constructor(createBranchUseCase: CreateBranchUseCase, pullRequestCreator: PullRequestCreator) {
    this.createBranchUseCase = createBranchUseCase;
    this.pullRequestCreator = pullRequestCreator
  }

  execute(
    input: CreateReleaseUseCaseInput
  ): Observable<CreateReleaseUseCaseOutput> {
    return this.createBranchUseCase
      .execute(
        new CreateBranchUseCaseInput(input.branchName, input.referenceBranch)
      ).pipe(flatMap((x) => this.pullRequestCreator.create(input.title, input.branchName, input.targetBranch)))
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
