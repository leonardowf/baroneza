import { Observable } from 'rxjs';
import { SHAFinder } from '../workers/sha-finder';
import { flatMap, mapTo } from 'rxjs/operators';
import { BranchCreator } from '../workers/branch-creator';

export class CreateBranchUseCaseInput {
  readonly branchName: string;
  readonly referenceBranch: string;
  readonly repository: string;

  constructor(branchName: string, referenceBranch: string, repository: string) {
    this.branchName = branchName;
    this.referenceBranch = referenceBranch;
    this.repository = repository;
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
      .execute(input.referenceBranch, input.repository)
      .pipe(flatMap((x) => this.branchCreator.create(x, input.branchName, input.repository)))
      .pipe(mapTo(new CreateBranchUseCaseOutput()));
  }
}
