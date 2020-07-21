import {
  JiraTagUseCase,
  TagUseCaseInput
} from '../../src/use-cases/tag-use-case';
import { CommitExtractor } from '../../src/workers/commit-extractor';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import { of } from 'rxjs';
import { JiraTicketParser } from '../../src/workers/jira-ticket-parser';
import {
  JiraTicketTagger,
  ConcreteJiraTicketTaggetOutput
} from '../../src/workers/jira-tagger';

describe('The tag use case', () => {
  it('calls the workers', (done) => {
    const commitExtractorMock: CommitExtractor = mock<CommitExtractor>();
    const jiraTickerParserMock: JiraTicketParser = mock<JiraTicketParser>();
    const jiraTicketTaggerMock: JiraTicketTagger = mock<JiraTicketTagger>();

    when(commitExtractorMock.commits(anything())).thenReturn(
      of(['A commit message'])
    );
    when(jiraTickerParserMock.parse(anything())).thenReturn(['123']);
    when(jiraTicketTaggerMock.tag(anything(), anything())).thenReturn(
      of(new ConcreteJiraTicketTaggetOutput(['123'], []))
    );

    const commitExtractor = instance(commitExtractorMock);
    const jiraTickerParser = instance(jiraTickerParserMock);
    const jiraTicketTagger = instance(jiraTicketTaggerMock);

    const jiraTagUseCase = new JiraTagUseCase({
      commitExtractor: commitExtractor,
      jiraTicketParser: jiraTickerParser,
      jiraTicketTagger: jiraTicketTagger
    });

    jiraTagUseCase.execute(new TagUseCaseInput(1, 'v1.0')).subscribe({
      next: (x) => {
        verify(commitExtractorMock.commits(anything())).once();
        verify(jiraTickerParserMock.parse(anything())).once();
        verify(jiraTicketTaggerMock.tag(anything(), anything())).once();

        expect(x.successes[0]).toEqual('123');
        done();
      }
    });
  });
});
