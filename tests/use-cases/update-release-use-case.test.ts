import { of, throwError } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';
import { JiraService } from '../../src/services/jira-service';
import { CreateChangelogUseCase } from '../../src/use-cases/create-changelog-use-case';
import {
  CreateMilestoneUseCase,
  CreateMilestoneUseCaseInput
} from '../../src/use-cases/create-milestone-use-case';
import { ExtractTicketsUseCase } from '../../src/use-cases/extract-tickets-use-case';
import { TagUseCase } from '../../src/use-cases/tag-use-case';
import {
  ConcreteUpdateReleaseUseCase,
  ConcreteUpdateReleaseUseCaseDependencies
} from '../../src/use-cases/update-release-use-case';
import { SlackMessageSender } from '../../src/workers/message-sender';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const buildMocks = () => ({
  createChangelogUseCase: mock<CreateChangelogUseCase>(),
  createMilestoneUseCase: mock<CreateMilestoneUseCase>(),
  extractTicketsUseCase: mock<ExtractTicketsUseCase>(),
  githubService: mock<GithubService>(),
  jiraService: mock<JiraService>(),
  owner: 'owner',
  slackMessageSender: mock<SlackMessageSender>(),
  tagUseCase: mock<TagUseCase>()
});

const buildDependencies = (
  mock: ReturnType<typeof buildMocks>
): ConcreteUpdateReleaseUseCaseDependencies => {
  return {
    createChangelogUseCase: instance(mock.createChangelogUseCase),
    createMilestoneUseCase: instance(mock.createMilestoneUseCase),
    extractTicketsUseCase: instance(mock.extractTicketsUseCase),
    githubService: instance(mock.githubService),
    jiraService: instance(mock.jiraService),
    owner: 'owner',
    slackMessageSender: instance(mock.slackMessageSender),
    tagUseCase: instance(mock.tagUseCase)
  };
};

const happyCaseNoChangelogNoCommits = (): {
  sut: ConcreteUpdateReleaseUseCase;
  mocks: ReturnType<typeof buildMocks>;
} => {
  const mocks = buildMocks();

  when(
    mocks.createChangelogUseCase.execute(
      deepEqual({
        origin: {
          type: 'pullRequestNumber',
          number: 123
        },
        repository: 'repository',
        version: 'toVersion'
      })
    )
  ).thenReturn(of(void 0));

  when(
    mocks.extractTicketsUseCase.execute(
      deepEqual({
        pullRequestNumber: 123,
        repository: 'repository'
      })
    )
  ).thenReturn(
    of({
      ticketIdsCommits: []
    })
  );

  when(
    mocks.jiraService.updateFixVersion('fromVersion', 'toVersion', 'project')
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateRelease(
      'fromVersion',
      'toVersion',
      'body',
      'owner',
      'repository'
    )
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateMilestone(
      'fromVersion',
      'toVersion',
      'owner',
      'repository'
    )
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateDescription(123, 'owner', 'repository', 'body')
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateTitle(123, 'title', 'owner', 'repository')
  ).thenReturn(of(void 0));

  when(mocks.tagUseCase.execute(anything())).thenReturn(
    of({
      successes: [],
      failures: []
    })
  );

  const createMilestoneUseCaseInput = new CreateMilestoneUseCaseInput(
    123,
    'repository',
    'toVersion'
  );

  when(
    mocks.createMilestoneUseCase.execute(deepEqual(createMilestoneUseCaseInput))
  ).thenReturn(of({}));

  const dependencies = buildDependencies(mocks);

  return { sut: new ConcreteUpdateReleaseUseCase(dependencies), mocks };
};

const jiraServiceFailing = (): {
  sut: ConcreteUpdateReleaseUseCase;
  mocks: ReturnType<typeof buildMocks>;
} => {
  const mocks = buildMocks();

  when(
    mocks.createChangelogUseCase.execute(
      deepEqual({
        origin: {
          type: 'pullRequestNumber',
          number: 123
        },
        repository: 'repository',
        version: 'toVersion'
      })
    )
  ).thenReturn(of(void 0));

  when(
    mocks.extractTicketsUseCase.execute(
      deepEqual({
        pullRequestNumber: 123,
        repository: 'repository'
      })
    )
  ).thenReturn(
    of({
      ticketIdsCommits: [
        {
          ticketId: 'ABC-123',
          commit: 'ABC-123 Bugs the fix'
        }
      ]
    })
  );

  when(mocks.jiraService.hasFixVersion('ABC-123')).thenReturn(throwError({}));

  when(
    mocks.jiraService.updateFixVersion('fromVersion', 'toVersion', 'project')
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateRelease(
      'fromVersion',
      'toVersion',
      'body',
      'owner',
      'repository'
    )
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateMilestone(
      'fromVersion',
      'toVersion',
      'owner',
      'repository'
    )
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateDescription(123, 'owner', 'repository', 'body')
  ).thenReturn(of(void 0));

  when(
    mocks.githubService.updateTitle(123, 'title', 'owner', 'repository')
  ).thenReturn(of(void 0));

  when(mocks.tagUseCase.execute(anything())).thenReturn(
    of({
      successes: [],
      failures: []
    })
  );

  const createMilestoneUseCaseInput = new CreateMilestoneUseCaseInput(
    123,
    'repository',
    'toVersion'
  );

  when(
    mocks.createMilestoneUseCase.execute(deepEqual(createMilestoneUseCaseInput))
  ).thenReturn(of({}));

  const dependencies = buildDependencies(mocks);

  return { sut: new ConcreteUpdateReleaseUseCase(dependencies), mocks };
};

describe('the update release use case', () => {
  it('executes correctly in an empty happy case', (done) => {
    const { sut } = happyCaseNoChangelogNoCommits();

    sut
      .execute({
        channel: 'channel',
        fromVersion: 'fromVersion',
        jiraSuffix: '',
        project: 'project',
        pullRequestNumber: 123,
        repository: 'repository',
        title: 'title',
        toVersion: 'toVersion'
      })
      .subscribe({
        next: () => {
          done();
        },
        error: () => {
          fail();
        }
      });
  });

  it('does not notify slack if jira service fails all fix-version fetches', (done) => {
    const { sut, mocks } = jiraServiceFailing();

    sut
      .execute({
        channel: 'channel',
        fromVersion: 'fromVersion',
        jiraSuffix: '',
        project: 'project',
        pullRequestNumber: 123,
        repository: 'repository',
        title: 'title',
        toVersion: 'toVersion'
      })
      .subscribe({
        next: () => {
          verify(mocks.slackMessageSender.send(anything())).never();
          done();
        },
        error: () => {
          fail();
        }
      });
  });
});
