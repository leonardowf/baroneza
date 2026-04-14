import { mock, instance, when, anything, verify } from 'ts-mockito';
import { of } from 'rxjs';
import { Block, KnownBlock } from '@slack/web-api';
import {
  ReleaseReadinessUseCase,
  ReleaseReadinessInput
} from '../../src/use-cases/release-readiness-use-case';
import { UnmergedPRsFetcher } from '../../src/workers/unmerged-prs-fetcher';
import { ReleaseReadinessBuilder } from '../../src/workers/release-readiness-builder';
import {
  MessageSender,
  MessageSenderOutput,
  KnownMessageType
} from '../../src/workers/message-sender';
import { DeploymentContextStore } from '../../src/store/deployment-context-store';
import { MergedPRTicketExtractor } from '../../src/workers/merged-pr-ticket-extractor';
import { QAPlanChecker } from '../../src/workers/qa-plan-checker';
import { QAPlanMessageBuilder } from '../../src/workers/qa-plan-message-builder';
import { OpenPullRequestSummary } from '../../src/services/github-service';
import { ReleaseChangesChecker } from '../../src/workers/release-changes-checker';

describe('The release readiness use case', () => {
  it('posts readiness message when there are open PRs', (done) => {
    const unmergedPRsFetcherMock = mock<UnmergedPRsFetcher>();
    const releaseReadinessBuilderMock = mock<ReleaseReadinessBuilder>();
    const messageSenderMock = mock<MessageSender<KnownMessageType>>();
    const deploymentContextStoreMock = mock<DeploymentContextStore>();
    const mergedPRTicketExtractorMock = mock<MergedPRTicketExtractor>();
    const qaPlanCheckerMock = mock<QAPlanChecker>();
    const qaPlanMessageBuilderMock = mock<QAPlanMessageBuilder>();
    const releaseChangesCheckerMock = mock<ReleaseChangesChecker>();

    const input: ReleaseReadinessInput = {
      channel: 'channel',
      baseBranch: 'develop',
      repository: 'repo',
      targetBranch: 'main',
      branchPrefix: 'release/',
      projectKeys: ['STO'],
      pullRequestTitlePrefix: 'Release',
      releaseType: 'patch',
      qaPlanFieldId: 'customfield_10071'
    };
    const prs: OpenPullRequestSummary[] = [
      {
        number: 1,
        title: 'PR 1',
        author: 'author',
        url: 'url/1',
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];
    const blocks: Block[] = [{ type: 'divider' }];

    when(
      releaseChangesCheckerMock.hasChanges(anything(), anything(), anything())
    ).thenReturn(of(true));
    when(
      unmergedPRsFetcherMock.fetch(input.repository, input.baseBranch)
    ).thenReturn(of(prs));
    when(releaseReadinessBuilderMock.build(prs)).thenReturn(blocks);
    when(messageSenderMock.send(anything())).thenReturn(
      of(new MessageSenderOutput('ts', 'channel'))
    );

    const sut = new ReleaseReadinessUseCase({
      unmergedPRsFetcher: instance(unmergedPRsFetcherMock),
      releaseReadinessBuilder: instance(releaseReadinessBuilderMock),
      messageSender: instance(messageSenderMock),
      deploymentContextStore: instance(deploymentContextStoreMock),
      mergedPRTicketExtractor: instance(mergedPRTicketExtractorMock),
      qaPlanChecker: instance(qaPlanCheckerMock),
      qaPlanMessageBuilder: instance(qaPlanMessageBuilderMock),
      jiraHost: 'jira.example.com',
      releaseChangesChecker: instance(releaseChangesCheckerMock)
    });

    sut.execute(input).subscribe({
      next: () => {
        verify(releaseReadinessBuilderMock.build(prs)).once();
        verify(messageSenderMock.send(anything())).once();
        verify(deploymentContextStoreMock.save(input)).once();
      },
      complete: done
    });
  });

  it('posts QA blocking message when no open PRs and some tickets are missing QA plans', (done) => {
    const unmergedPRsFetcherMock = mock<UnmergedPRsFetcher>();
    const releaseReadinessBuilderMock = mock<ReleaseReadinessBuilder>();
    const messageSenderMock = mock<MessageSender<KnownMessageType>>();
    const deploymentContextStoreMock = mock<DeploymentContextStore>();
    const mergedPRTicketExtractorMock = mock<MergedPRTicketExtractor>();
    const qaPlanCheckerMock = mock<QAPlanChecker>();
    const qaPlanMessageBuilderMock = mock<QAPlanMessageBuilder>();
    const releaseChangesCheckerMock = mock<ReleaseChangesChecker>();

    const input: ReleaseReadinessInput = {
      channel: 'channel',
      baseBranch: 'develop',
      repository: 'repo',
      targetBranch: 'main',
      branchPrefix: 'release/',
      projectKeys: ['STO'],
      pullRequestTitlePrefix: 'Release',
      releaseType: 'patch',
      qaPlanFieldId: 'customfield_10071'
    };
    const qaBlocks: KnownBlock[] = [
      { type: 'section', text: { type: 'mrkdwn', text: 'missing' } }
    ];

    when(
      releaseChangesCheckerMock.hasChanges(anything(), anything(), anything())
    ).thenReturn(of(true));
    when(
      unmergedPRsFetcherMock.fetch(input.repository, input.baseBranch)
    ).thenReturn(of([]));
    when(
      mergedPRTicketExtractorMock.extract(anything(), anything())
    ).thenReturn(of(['STO-1']));
    when(qaPlanCheckerMock.check(anything(), anything())).thenReturn(
      of({ missingQAPlan: ['STO-1'] })
    );
    when(qaPlanMessageBuilderMock.build(anything(), anything())).thenReturn(
      qaBlocks
    );
    when(messageSenderMock.send(anything())).thenReturn(
      of(new MessageSenderOutput('ts', 'channel'))
    );

    const sut = new ReleaseReadinessUseCase({
      unmergedPRsFetcher: instance(unmergedPRsFetcherMock),
      releaseReadinessBuilder: instance(releaseReadinessBuilderMock),
      messageSender: instance(messageSenderMock),
      deploymentContextStore: instance(deploymentContextStoreMock),
      mergedPRTicketExtractor: instance(mergedPRTicketExtractorMock),
      qaPlanChecker: instance(qaPlanCheckerMock),
      qaPlanMessageBuilder: instance(qaPlanMessageBuilderMock),
      jiraHost: 'jira.example.com',
      releaseChangesChecker: instance(releaseChangesCheckerMock)
    });

    sut.execute(input).subscribe({
      next: () => {
        verify(qaPlanMessageBuilderMock.build(anything(), anything())).once();
        verify(messageSenderMock.send(anything())).once();
      },
      complete: done
    });
  });

  it('posts ready message when no open PRs and all QA plans are present', (done) => {
    const unmergedPRsFetcherMock = mock<UnmergedPRsFetcher>();
    const releaseReadinessBuilderMock = mock<ReleaseReadinessBuilder>();
    const messageSenderMock = mock<MessageSender<KnownMessageType>>();
    const deploymentContextStoreMock = mock<DeploymentContextStore>();
    const mergedPRTicketExtractorMock = mock<MergedPRTicketExtractor>();
    const qaPlanCheckerMock = mock<QAPlanChecker>();
    const qaPlanMessageBuilderMock = mock<QAPlanMessageBuilder>();
    const releaseChangesCheckerMock = mock<ReleaseChangesChecker>();

    const input: ReleaseReadinessInput = {
      channel: 'channel',
      baseBranch: 'develop',
      repository: 'repo',
      targetBranch: 'main',
      branchPrefix: 'release/',
      projectKeys: ['STO'],
      pullRequestTitlePrefix: 'Release',
      releaseType: 'patch',
      qaPlanFieldId: 'customfield_10071'
    };
    const readyBlocks: Block[] = [
      { type: 'header', text: { type: 'plain_text', text: 'ready' } } as Block
    ];

    when(
      releaseChangesCheckerMock.hasChanges(anything(), anything(), anything())
    ).thenReturn(of(true));
    when(
      unmergedPRsFetcherMock.fetch(input.repository, input.baseBranch)
    ).thenReturn(of([]));
    when(
      mergedPRTicketExtractorMock.extract(anything(), anything())
    ).thenReturn(of(['STO-1']));
    when(qaPlanCheckerMock.check(anything(), anything())).thenReturn(
      of({ missingQAPlan: [] })
    );
    when(releaseReadinessBuilderMock.buildReadyMessage()).thenReturn(
      readyBlocks
    );
    when(messageSenderMock.send(anything())).thenReturn(
      of(new MessageSenderOutput('ts', 'channel'))
    );

    const sut = new ReleaseReadinessUseCase({
      unmergedPRsFetcher: instance(unmergedPRsFetcherMock),
      releaseReadinessBuilder: instance(releaseReadinessBuilderMock),
      messageSender: instance(messageSenderMock),
      deploymentContextStore: instance(deploymentContextStoreMock),
      mergedPRTicketExtractor: instance(mergedPRTicketExtractorMock),
      qaPlanChecker: instance(qaPlanCheckerMock),
      qaPlanMessageBuilder: instance(qaPlanMessageBuilderMock),
      jiraHost: 'jira.example.com',
      releaseChangesChecker: instance(releaseChangesCheckerMock)
    });

    sut.execute(input).subscribe({
      next: () => {
        verify(releaseReadinessBuilderMock.buildReadyMessage()).once();
        verify(messageSenderMock.send(anything())).once();
      },
      complete: done
    });
  });

  it('posts no changes message when baseBranch has no new commits ahead of targetBranch', (done) => {
    const unmergedPRsFetcherMock = mock<UnmergedPRsFetcher>();
    const releaseReadinessBuilderMock = mock<ReleaseReadinessBuilder>();
    const messageSenderMock = mock<MessageSender<KnownMessageType>>();
    const deploymentContextStoreMock = mock<DeploymentContextStore>();
    const mergedPRTicketExtractorMock = mock<MergedPRTicketExtractor>();
    const qaPlanCheckerMock = mock<QAPlanChecker>();
    const qaPlanMessageBuilderMock = mock<QAPlanMessageBuilder>();
    const releaseChangesCheckerMock = mock<ReleaseChangesChecker>();

    const input: ReleaseReadinessInput = {
      channel: 'channel',
      baseBranch: 'develop',
      repository: 'repo',
      targetBranch: 'main',
      branchPrefix: 'release/',
      projectKeys: ['STO'],
      pullRequestTitlePrefix: 'Release',
      releaseType: 'patch',
      qaPlanFieldId: 'customfield_10071'
    };
    const noChangesBlocks: Block[] = [{ type: 'divider' }];

    when(
      releaseChangesCheckerMock.hasChanges(anything(), anything(), anything())
    ).thenReturn(of(false));
    when(releaseReadinessBuilderMock.buildNoChangesMessage()).thenReturn(
      noChangesBlocks
    );
    when(messageSenderMock.send(anything())).thenReturn(
      of(new MessageSenderOutput('ts', 'channel'))
    );

    const sut = new ReleaseReadinessUseCase({
      unmergedPRsFetcher: instance(unmergedPRsFetcherMock),
      releaseReadinessBuilder: instance(releaseReadinessBuilderMock),
      messageSender: instance(messageSenderMock),
      deploymentContextStore: instance(deploymentContextStoreMock),
      mergedPRTicketExtractor: instance(mergedPRTicketExtractorMock),
      qaPlanChecker: instance(qaPlanCheckerMock),
      qaPlanMessageBuilder: instance(qaPlanMessageBuilderMock),
      jiraHost: 'jira.example.com',
      releaseChangesChecker: instance(releaseChangesCheckerMock)
    });

    sut.execute(input).subscribe({
      next: () => {
        verify(releaseReadinessBuilderMock.buildNoChangesMessage()).once();
        verify(messageSenderMock.send(anything())).once();
        verify(deploymentContextStoreMock.save(anything())).never();
        verify(unmergedPRsFetcherMock.fetch(anything(), anything())).never();
      },
      complete: done
    });
  });
});
