import { Observable } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo } from 'rxjs/operators';

export class CreateReleaseUseCaseInput {
  branchName: string;
  referenceBranch: string;
}

export class CreateReleaseUseCaseOutput {}

export class CreateReleaseUseCase {
  private createBranchUseCase: CreateBranchUseCase;

  constructor(createBranchUseCase: CreateBranchUseCase) {
    this.createBranchUseCase = createBranchUseCase;
  }

  execute(
    input: CreateReleaseUseCaseInput
  ): Observable<CreateReleaseUseCaseOutput> {
    return this.createBranchUseCase
      .execute(
        new CreateBranchUseCaseInput(input.branchName, input.referenceBranch)
      )
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
