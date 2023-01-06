import {
  JiraTagUseCase,
  TagUseCaseInput
} from '../../src/use-cases/tag-use-case';
import {
  GithubPullRequestExtractor,
  GithubShaExtractor
} from '../../src/workers/commit-extractor';
import { mock, instance, when, anything, verify, deepEqual } from 'ts-mockito';
import { of } from 'rxjs';
import {
  JiraTicketParser,
  JiraTicketParserOutput
} from '../../src/workers/jira-ticket-parser';
import {
  JiraTicketTagger,
  ConcreteJiraTicketTaggetOutput
} from '../../src/workers/jira-tagger';
import {
  CreateVersionUseCase,
  CreateVersionUseCaseInput,
  CreateVersionUseCaseOutput
} from '../../src/use-cases/create-version-use-case';
import { ConcreteExtractTicketsUseCase } from '../../src/use-cases/extract-tickets-use-case';

describe('The tag use case with PR', () => {
  it('calls the workers', (done) => {
    const pullRequestCommitExtractorMock: GithubPullRequestExtractor = mock<
      GithubPullRequestExtractor
    >();
    const shaCommitExtractorMock: GithubShaExtractor = mock<
      GithubShaExtractor
    >();
    const jiraTicketParserMock: JiraTicketParser = mock<JiraTicketParser>();
    const jiraTicketTaggerMock: JiraTicketTagger = mock<JiraTicketTagger>();
    const createVersionUseCaseMock: CreateVersionUseCase = mock<
      CreateVersionUseCase
    >();

    when(pullRequestCommitExtractorMock.commits(1, 'repository')).thenReturn(
      of(['A commit message'])
    );
    when(shaCommitExtractorMock.commits(anything(), 'repository')).thenReturn(
      of(['A commit message'])
    );
    const jiraTicketParserOutput: JiraTicketParserOutput = {
      parsedTickets: [{ value: 'a commit message COM-123', ticket: '123' }]
    };

    when(jiraTicketParserMock.parse(anything())).thenReturn(
      jiraTicketParserOutput
    );
    when(jiraTicketTaggerMock.tag(anything(), anything())).thenReturn(
      of(new ConcreteJiraTicketTaggetOutput(['123'], []))
    );
    when(createVersionUseCaseMock.execute(anything())).thenReturn(
      of([
        new CreateVersionUseCaseOutput({ projectKey: 'COM', result: 'CREATED' })
      ])
    );

    const pullRequestCommitExtractor = instance(pullRequestCommitExtractorMock);
    const shaCommitExtractor = instance(shaCommitExtractorMock);
    const jiraTickerParser = instance(jiraTicketParserMock);
    const jiraTicketTagger = instance(jiraTicketTaggerMock);
    const createVersionUseCase = instance(createVersionUseCaseMock);

    const extractTicketsUseCase = new ConcreteExtractTicketsUseCase(
      pullRequestCommitExtractor,
      shaCommitExtractor,
      jiraTickerParser
    );

    const jiraTagUseCase = new JiraTagUseCase(
      extractTicketsUseCase,
      jiraTicketTagger,
      createVersionUseCase
    );

    jiraTagUseCase
      .execute(new TagUseCaseInput(1, 'v1.0', ['PSF'], 'repository', ' suffix'))
      .subscribe({
        next: (x) => {
          verify(
            pullRequestCommitExtractorMock.commits(1, 'repository')
          ).once();
          verify(
            shaCommitExtractorMock.commits(anything(), 'repository')
          ).never();
          verify(jiraTicketParserMock.parse(anything())).once();
          verify(jiraTicketTaggerMock.tag(anything(), anything())).once();
          verify(
            createVersionUseCaseMock.execute(
              deepEqual(new CreateVersionUseCaseInput(['PSF'], 'v1.0 suffix'))
            )
          ).once();

          expect(x.successes[0]).toEqual('123');
          done();
        }
      });
  });
});

describe('The tag use case with SHA', () => {
  it('calls the workers', (done) => {
    const pullRequestCommitExtractorMock: GithubPullRequestExtractor = mock<
      GithubPullRequestExtractor
    >();
    const shaCommitExtractorMock: GithubShaExtractor = mock<
      GithubShaExtractor
    >();
    const jiraTicketParserMock: JiraTicketParser = mock<JiraTicketParser>();
    const jiraTicketTaggerMock: JiraTicketTagger = mock<JiraTicketTagger>();
    const createVersionUseCaseMock: CreateVersionUseCase = mock<
      CreateVersionUseCase
    >();

    when(
      pullRequestCommitExtractorMock.commits(anything(), 'repository')
    ).thenReturn(of(['A commit message']));
    when(
      shaCommitExtractorMock.commits(
        deepEqual({ start: 'sha', end: 'sha2' }),
        'repository'
      )
    ).thenReturn(of(['A commit message']));
    const jiraTicketParserOutput: JiraTicketParserOutput = {
      parsedTickets: [{ value: 'a commit message COM-123', ticket: '123' }]
    };

    when(jiraTicketParserMock.parse(anything())).thenReturn(
      jiraTicketParserOutput
    );
    when(jiraTicketTaggerMock.tag(anything(), anything())).thenReturn(
      of(new ConcreteJiraTicketTaggetOutput(['123'], []))
    );
    when(createVersionUseCaseMock.execute(anything())).thenReturn(
      of([
        new CreateVersionUseCaseOutput({
          projectKey: 'COM',
          result: 'CREATED'
        })
      ])
    );

    const pullRequestCommitExtractor = instance(pullRequestCommitExtractorMock);
    const shaCommitExtractor = instance(shaCommitExtractorMock);
    const jiraTickerParser = instance(jiraTicketParserMock);
    const jiraTicketTagger = instance(jiraTicketTaggerMock);
    const createVersionUseCase = instance(createVersionUseCaseMock);

    const extractTicketsUseCase = new ConcreteExtractTicketsUseCase(
      pullRequestCommitExtractor,
      shaCommitExtractor,
      jiraTickerParser
    );

    const jiraTagUseCase = new JiraTagUseCase(
      extractTicketsUseCase,
      jiraTicketTagger,
      createVersionUseCase
    );

    jiraTagUseCase
      .execute(
        new TagUseCaseInput(
          { start: 'sha', end: 'sha2' },
          'v1.0',
          ['PSF'],
          'repository',
          ' suffix'
        )
      )
      .subscribe({
        next: (x) => {
          verify(
            pullRequestCommitExtractorMock.commits(anything(), 'repository')
          ).never();
          verify(
            shaCommitExtractorMock.commits(
              deepEqual({ start: 'sha', end: 'sha2' }),
              'repository'
            )
          ).once();
          verify(jiraTicketParserMock.parse(anything())).once();
          verify(jiraTicketTaggerMock.tag(anything(), anything())).once();
          verify(
            createVersionUseCaseMock.execute(
              deepEqual(new CreateVersionUseCaseInput(['PSF'], 'v1.0 suffix'))
            )
          ).once();

          expect(x.successes[0]).toEqual('123');
          done();
        }
      });
  });
});
