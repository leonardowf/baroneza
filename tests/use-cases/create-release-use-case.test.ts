import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from '../../src/use-cases/create-release-use-case';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput,
  CreateBranchUseCaseOutput
} from '../../src/use-cases/create-branch-use-case';
import { PullRequestCreator, PullRequestCreatorOutput } from '../../src/workers/pull-request-creator';
import { TagUseCase, TagUseCaseInput, TagUseCaseOutput } from '../../src/use-cases/tag-use-case';
import { CreateChangelogUseCase, CreateChangelogInput } from '../../src/use-cases/create-changelog-use-case';
import { ReleasePageCreator } from '../../src/workers/release-page-creator';
import { PullRequestDescriptionWriter } from '../../src/workers/pull-request-description-writer';

import { mock, instance, when, deepEqual } from 'ts-mockito';
import { of } from 'rxjs';

describe('the create release use case', () => {
  it('executes correctly', (done) => {
    const createBranchUseCaseMock = mock<CreateBranchUseCase>();
    const pullRequestCreatorMock = mock<PullRequestCreator>();
    const tagUseCaseMock = mock<TagUseCase>();
    const createChangelogUseCaseMock = mock<CreateChangelogUseCase>();
    const releasePageCreatorMock = mock<ReleasePageCreator>();
    const pullRequestDescriptionWriterMock = mock<
      PullRequestDescriptionWriter
    >();

    when(
      createBranchUseCaseMock.execute(
        deepEqual(
          new CreateBranchUseCaseInput(
            'branchName',
            'referenceBranch',
            'repository'
          )
        )
      )
    ).thenReturn(of(new CreateBranchUseCaseOutput()));

    when(pullRequestCreatorMock.create("title", "branchName", "targetBranch", "repository")).thenReturn(of(new PullRequestCreatorOutput(123)))
    when(tagUseCaseMock.execute(deepEqual(new TagUseCaseInput(123, "projectTag", "project", "repository")))).thenReturn(of(new TagUseCaseOutput([], [])))
    when(createChangelogUseCaseMock.execute(deepEqual(new CreateChangelogInput(123, "repository", "projectTag")))).thenReturn(of("changelog"))
    when(pullRequestDescriptionWriterMock.write(123, "repository", "changelog")).thenReturn(of(void 0))
    when(releasePageCreatorMock.create("projectTag", "projectTag", "repository", "changelog")).thenReturn(of(void 0))

    const createBranchUseCase = instance(createBranchUseCaseMock);
    const pullRequestCreator = instance(pullRequestCreatorMock);
    const tagUseCase = instance(tagUseCaseMock);
    const createChangelogUseCase = instance(createChangelogUseCaseMock);
    const releasePageCreator = instance(releasePageCreatorMock);
    const pullRequestDescriptionWriter = instance(
      pullRequestDescriptionWriterMock
    );

    const sut = new CreateReleaseUseCase(
      createBranchUseCase,
      pullRequestCreator,
      tagUseCase,
      createChangelogUseCase,
      releasePageCreator,
      pullRequestDescriptionWriter
    );

    sut.execute(
      new CreateReleaseUseCaseInput(
        'branchName',
        'referenceBranch',
        'targetBranch',
        'title',
        'projectTag',
        'project',
        'repository'
      )
    ).subscribe({
        error: (error) => {
            done.fail()
        },
        complete: done
    });
  });
});
