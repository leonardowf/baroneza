import {
  JiraTagUseCase,
  TagUseCaseInput
} from '../../src/use-cases/tag-use-case';
import { CommitExtractor } from '../../src/workers/commit-extractor';
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

describe('The tag use case', () => {
  it('calls the workers', (done) => {
    const commitExtractorMock: CommitExtractor = mock<CommitExtractor>();
    const jiraTicketParserMock: JiraTicketParser = mock<JiraTicketParser>();
    const jiraTicketTaggerMock: JiraTicketTagger = mock<JiraTicketTagger>();
    const createVersionUseCaseMock: CreateVersionUseCase = mock<
      CreateVersionUseCase
    >();

    when(commitExtractorMock.commits(anything(), 'repository')).thenReturn(
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
      of(new CreateVersionUseCaseOutput())
    );

    const commitExtractor = instance(commitExtractorMock);
    const jiraTickerParser = instance(jiraTicketParserMock);
    const jiraTicketTagger = instance(jiraTicketTaggerMock);
    const createVersionUseCase = instance(createVersionUseCaseMock);

    const extractTicketsUseCase = new ConcreteExtractTicketsUseCase(
      commitExtractor,
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
          verify(commitExtractorMock.commits(anything(), 'repository')).once();
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
