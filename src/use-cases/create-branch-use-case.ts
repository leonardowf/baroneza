import { Observable } from 'rxjs';
import { SHAFinder } from '../workers/sha-finder';
import { flatMap, mapTo } from 'rxjs/operators';
import { BranchCreator } from '../workers/branch-creator';

export class CreateBranchUseCaseInput {
  branchName: string;
  referenceBranch: string;

  constructor(branchName: string, referenceBranch: string) {
    this.branchName = branchName;
    this.referenceBranch = referenceBranch;
  }
}

export class CreateBranchUseCaseOutput {}

export interface CreateBranchUseCase {
  execute(
    input: CreateBranchUseCaseInput
  ): Observable<CreateBranchUseCaseOutput>;
}

export class GithubCreateBranchUseCase implements CreateBranchUseCase {
  private shaFinder: SHAFinder;
  private branchCreator: BranchCreator;

  constructor(shaFinder: SHAFinder, branchCreator: BranchCreator) {
    this.shaFinder = shaFinder;
    this.branchCreator = branchCreator;
  }

  execute(
    input: CreateBranchUseCaseInput
  ): Observable<CreateBranchUseCaseOutput> {
    return this.shaFinder
      .execute(input.referenceBranch)
      .pipe(flatMap((x) => this.branchCreator.create(x, input.branchName)))
      .pipe(mapTo(new CreateBranchUseCaseOutput()));
  }
}
