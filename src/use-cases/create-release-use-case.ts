import { Observable, of } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo, flatMap, map } from 'rxjs/operators';
import { PullRequestCreator } from '../workers/pull-request-creator';
import { TagUseCase, TagUseCaseInput } from './tag-use-case';
import {
  CreateChangelogUseCase,
  CreateChangelogInput
} from './create-changelog-use-case';

export class CreateReleaseUseCaseInput {
  branchName: string;
  referenceBranch: string;
  targetBranch: string;
  title: string;
  projectTag: string; // this is the tag, better naming please, example 1.0.0
  project: string;
  repository: string;

  constructor(
    branchName: string,
    referenceBranch: string,
    targetBranch: string,
    title: string,
    projectTag: string,
    project: string,
    repository: string
  ) {
    this.branchName = branchName;
    this.referenceBranch = referenceBranch;
    this.targetBranch = targetBranch;
    this.title = title;
    this.projectTag = projectTag;
    this.project = project;
    this.repository = repository;
  }
}

export class CreateReleaseUseCaseOutput {}

export class CreateReleaseUseCase {
  private createBranchUseCase: CreateBranchUseCase;
  private pullRequestCreator: PullRequestCreator;
  private tagUseCase: TagUseCase;
  private createChangelogUseCase: CreateChangelogUseCase;

  constructor(
    createBranchUseCase: CreateBranchUseCase,
    pullRequestCreator: PullRequestCreator,
    tagUseCase: TagUseCase,
    createChangelogUseCase: CreateChangelogUseCase
  ) {
    this.createBranchUseCase = createBranchUseCase;
    this.pullRequestCreator = pullRequestCreator;
    this.tagUseCase = tagUseCase;
    this.createChangelogUseCase = createChangelogUseCase;
  }

  execute(
    input: CreateReleaseUseCaseInput
  ): Observable<CreateReleaseUseCaseOutput> {
    return this.createBranchUseCase
      .execute(
        new CreateBranchUseCaseInput(
          input.branchName,
          input.referenceBranch,
          input.repository
        )
      )
      .pipe(
        flatMap(() =>
          this.pullRequestCreator.create(
            input.title,
            input.branchName,
            input.targetBranch,
            input.repository
          )
        )
      )
      .pipe(
        flatMap((x) =>
          this.tagUseCase
            .execute(
              new TagUseCaseInput(
                x.identifier,
                input.projectTag,
                input.project,
                input.repository
              )
            )
            .pipe(
              flatMap((y) => {
                return this.createChangelogUseCase.execute(
                  new CreateChangelogInput(
                    x.identifier,
                    input.repository,
                    input.projectTag
                  )
                );
              })
            )
        )
      )
      .pipe(
        map((changelog) => {
          console.log(changelog);
          return changelog;
        })
      )
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
