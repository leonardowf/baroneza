import { Observable, of, zip } from 'rxjs';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput
} from './create-branch-use-case';
import { mapTo, flatMap } from 'rxjs/operators';
import { PullRequestCreator } from '../workers/pull-request-creator';
import { TagUseCase, TagUseCaseInput } from './tag-use-case';
import {
  CreateChangelogUseCase,
  CreateChangelogInput
} from './create-changelog-use-case';
import { ReleasePageCreator } from '../workers/release-page-creator';
import { PullRequestDescriptionWriter } from './pull-request-description-writer';

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
  private readonly createBranchUseCase: CreateBranchUseCase;
  private readonly pullRequestCreator: PullRequestCreator;
  private readonly tagUseCase: TagUseCase;
  private readonly createChangelogUseCase: CreateChangelogUseCase;
  private readonly releasePageCreator: ReleasePageCreator;
  private readonly pullRequestDescriptionWriter: PullRequestDescriptionWriter;

  constructor(
    createBranchUseCase: CreateBranchUseCase,
    pullRequestCreator: PullRequestCreator,
    tagUseCase: TagUseCase,
    createChangelogUseCase: CreateChangelogUseCase,
    releasePageCreator: ReleasePageCreator,
    pullRequestDescriptionWriter: PullRequestDescriptionWriter
  ) {
    this.createBranchUseCase = createBranchUseCase;
    this.pullRequestCreator = pullRequestCreator;
    this.tagUseCase = tagUseCase;
    this.createChangelogUseCase = createChangelogUseCase;
    this.releasePageCreator = releasePageCreator;
    this.pullRequestDescriptionWriter = pullRequestDescriptionWriter;
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
              flatMap(() => {
                return this.createChangelogUseCase
                  .execute(
                    new CreateChangelogInput(
                      x.identifier,
                      input.repository,
                      input.projectTag
                    )
                  )
                  .pipe(
                    flatMap((changelog) => {
                      let writeOnPR: Observable<void> = of(void 0);
                      if (changelog !== undefined) {
                        writeOnPR = this.pullRequestDescriptionWriter.write(
                          x.identifier,
                          input.repository,
                          changelog
                        );
                      }

                      return zip(
                        this.releasePageCreator.create(
                          input.projectTag,
                          input.projectTag,
                          input.repository,
                          changelog
                        ),
                        writeOnPR
                      );
                    })
                  );
              })
            )
        )
      )
      .pipe(mapTo(new CreateReleaseUseCaseOutput()));
  }
}
