import { Observable } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo, flatMap } from 'rxjs/operators';
import { PullRequestCreator } from '../repositories/pull-request-creator';
import { TagUseCase, TagUseCaseInput } from './tag-use-case';

export class CreateReleaseUseCaseInput {
  branchName: string;
  referenceBranch: string;
  targetBranch: string;
  title: string;

  constructor(
    branchName: string,
    referenceBranch: string,
    targetBranch: string,
    title: string
  ) {
    this.branchName = branchName;
    this.referenceBranch = referenceBranch;
    this.targetBranch = targetBranch;
    this.title = title;
  }
}

export class CreateReleaseUseCaseOutput {}

export class CreateReleaseUseCase {
  private createBranchUseCase: CreateBranchUseCase;
  private pullRequestCreator: PullRequestCreator;
  private tagUseCase: TagUseCase;

  constructor(
    createBranchUseCase: CreateBranchUseCase,
    pullRequestCreator: PullRequestCreator,
    tagUseCase: TagUseCase
  ) {
    this.createBranchUseCase = createBranchUseCase;
    this.pullRequestCreator = pullRequestCreator;
    this.tagUseCase = tagUseCase;
  }

  execute(
    input: CreateReleaseUseCaseInput
  ): Observable<CreateReleaseUseCaseOutput> {
    return this.createBranchUseCase
      .execute(
        new CreateBranchUseCaseInput(input.branchName, input.referenceBranch)
      )
      .pipe(
        flatMap(() =>
          this.pullRequestCreator.create(
            input.title,
            input.branchName,
            input.targetBranch
          )
        )
      )
      .pipe(
        flatMap((x) =>
          this.tagUseCase.execute(
            new TagUseCaseInput(x.identifier, input.branchName)
          )
        )
      )
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
