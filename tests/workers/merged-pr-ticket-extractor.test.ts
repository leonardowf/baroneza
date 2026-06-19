import { GithubService } from '../../src/services/github-service';
import { JiraTicketParser, ParsedTicket } from '../../src/workers/jira-ticket-parser';
import { GithubMergedPRTicketExtractor } from '../../src/workers/merged-pr-ticket-extractor';
import { mock, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('The merged PR ticket extractor', () => {
  it('extracts Jira ticket IDs from merged PR titles', (done) => {
    const githubServiceMock = mock<GithubService>();
    const jiraTicketParserMock = mock<JiraTicketParser>();
    const titles = ['STO-1 Add feature', 'STO-2 Fix bug'];
    const parsedTickets: ParsedTicket[] = [
      { ticket: 'STO-1', value: 'STO-1 Add feature' },
      { ticket: 'STO-2', value: 'STO-2 Fix bug' }
    ];

    when(githubServiceMock.listMergedPullRequestTitles('owner', 'repo', 'develop')).thenReturn(of(titles));
    when(jiraTicketParserMock.parse(titles)).thenReturn({ parsedTickets });

    const sut = new GithubMergedPRTicketExtractor(instance(githubServiceMock), 'owner', instance(jiraTicketParserMock));

    sut.extract('repo', 'develop').subscribe({
      next: (result) => {
        expect(result).toEqual(['STO-1', 'STO-2']);
      },
      complete: done
    });
  });

  it('returns empty array when no Jira tickets found in PR titles', (done) => {
    const githubServiceMock = mock<GithubService>();
    const jiraTicketParserMock = mock<JiraTicketParser>();
    const titles = ['Update readme', 'Fix typo'];

    when(githubServiceMock.listMergedPullRequestTitles('owner', 'repo', 'develop')).thenReturn(of(titles));
    when(jiraTicketParserMock.parse(titles)).thenReturn({ parsedTickets: [] });

    const sut = new GithubMergedPRTicketExtractor(instance(githubServiceMock), 'owner', instance(jiraTicketParserMock));

    sut.extract('repo', 'develop').subscribe({
      next: (result) => {
        expect(result).toEqual([]);
      },
      complete: done
    });
  });
});
