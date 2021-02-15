import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from '../../src/use-cases/create-release-use-case';
import {
  CreateBranchUseCase,
  CreateBranchUseCaseInput,
  CreateBranchUseCaseOutput
} from '../../src/use-cases/create-branch-use-case';
import {
  PullRequestCreator,
  PullRequestCreatorOutput
} from '../../src/workers/pull-request-creator';
import {
  TagUseCase,
  TagUseCaseInput,
  TagUseCaseOutput
} from '../../src/use-cases/tag-use-case';
import {
  CreateChangelogUseCase,
  CreateChangelogInput,
  CreateChangelogOutput
} from '../../src/use-cases/create-changelog-use-case';
import { ReleasePageCreator } from '../../src/workers/release-page-creator';
import { PullRequestDescriptionWriter } from '../../src/workers/pull-request-description-writer';

import { mock, instance, when, deepEqual } from 'ts-mockito';
import { of } from 'rxjs';
import {
  MessageSender,
  MessageSenderInput,
  MessageSenderOutput
} from '../../src/workers/message-sender';
import {
  CreateMilestoneUseCase,
  CreateMilestoneUseCaseInput,
  CreateMilestoneUseCaseOutput
} from '../../src/use-cases/create-milestone-use-case';
import { Block } from '@slack/web-api';

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
    const createMilestoneUseCaseMock = mock<CreateMilestoneUseCase>();

    const messageSenderMock = mock<MessageSender<Block[]>>();

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

    const createChangelogOutput: CreateChangelogOutput = {
      blocks: { type: "blocks", content: []},
      markdown: { type: "markdown", content: "changelog"}
    }
            
    when(
      pullRequestCreatorMock.create(
        'title',
        'branchName',
        'targetBranch',
        'repository'
      )
    ).thenReturn(of(new PullRequestCreatorOutput(123, 456)));
    when(
      tagUseCaseMock.execute(
        deepEqual(
          new TagUseCaseInput(123, 'projectTag', 'project', 'repository', ' suffix')
        )
      )
    ).thenReturn(of(new TagUseCaseOutput([], [])));
    when(
      createChangelogUseCaseMock.execute(
        deepEqual(new CreateChangelogInput(123, 'repository', 'projectTag'))
      )
    ).thenReturn(of(createChangelogOutput))
    when(
      pullRequestDescriptionWriterMock.write(123, 'repository', 'changelog')
    ).thenReturn(of(void 0));
    when(
      releasePageCreatorMock.create(
        'projectTag',
        'projectTag',
        'repository',
        'changelog'
      )
    ).thenReturn(of(void 0));

    when(
      messageSenderMock.send(
        deepEqual({ destination: 'channel', content: [] })
      )
    ).thenReturn(of(new MessageSenderOutput('123', '456')));

    const createMilestoneUseCaseInput = new CreateMilestoneUseCaseInput(
      123,
      'repository',
      'projectTag',
      456
    );
    when(
      createMilestoneUseCaseMock.execute(deepEqual(createMilestoneUseCaseInput))
    ).thenReturn(of(new CreateMilestoneUseCaseOutput()));

    const createBranchUseCase = instance(createBranchUseCaseMock);
    const pullRequestCreator = instance(pullRequestCreatorMock);
    const tagUseCase = instance(tagUseCaseMock);
    const createChangelogUseCase = instance(createChangelogUseCaseMock);
    const releasePageCreator = instance(releasePageCreatorMock);
    const pullRequestDescriptionWriter = instance(
      pullRequestDescriptionWriterMock
    );
    const messageSender = instance(messageSenderMock);
    const createMilestoneUseCase = instance(createMilestoneUseCaseMock);

    const sut = new CreateReleaseUseCase(
      createBranchUseCase,
      pullRequestCreator,
      tagUseCase,
      createChangelogUseCase,
      releasePageCreator,
      pullRequestDescriptionWriter,
      messageSender,
      createMilestoneUseCase
    );

    sut
      .execute(
        new CreateReleaseUseCaseInput(
          'branchName',
          'referenceBranch',
          'targetBranch',
          'title',
          'projectTag',
          'project',
          'repository',
          'channel',
          ' suffix'
        )
      )
      .subscribe({
        error: (error) => {
          done.fail();
        },
        complete: done
      });
  });
});
