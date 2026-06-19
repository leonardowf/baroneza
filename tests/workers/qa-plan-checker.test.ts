import { JiraService } from '../../src/services/jira-service';
import { ConcreteJiraQAPlanChecker } from '../../src/workers/qa-plan-checker';
import { mock, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('The QA plan checker', () => {
  it('returns no missing tickets when given an empty list of ticket ids', (done) => {
    const jiraServiceMock = mock<JiraService>();
    const sut = new ConcreteJiraQAPlanChecker(instance(jiraServiceMock));

    sut.check([], 'customfield_10071').subscribe({
      next: (result) => {
        expect(result.missingQAPlan).toEqual([]);
      },
      complete: done
    });
  });

  it('returns no missing tickets when all tickets have QA plans', (done) => {
    const jiraServiceMock = mock<JiraService>();
    when(jiraServiceMock.hasQAPlan('STO-1', 'customfield_10071')).thenReturn(of(true));
    when(jiraServiceMock.hasQAPlan('STO-2', 'customfield_10071')).thenReturn(of(true));

    const sut = new ConcreteJiraQAPlanChecker(instance(jiraServiceMock));

    sut.check(['STO-1', 'STO-2'], 'customfield_10071').subscribe({
      next: (result) => {
        expect(result.missingQAPlan).toEqual([]);
      },
      complete: done
    });
  });

  it('returns only the tickets that are missing a QA plan', (done) => {
    const jiraServiceMock = mock<JiraService>();
    when(jiraServiceMock.hasQAPlan('STO-1', 'customfield_10071')).thenReturn(of(true));
    when(jiraServiceMock.hasQAPlan('STO-2', 'customfield_10071')).thenReturn(of(false));
    when(jiraServiceMock.hasQAPlan('STO-3', 'customfield_10071')).thenReturn(of(false));

    const sut = new ConcreteJiraQAPlanChecker(instance(jiraServiceMock));

    sut.check(['STO-1', 'STO-2', 'STO-3'], 'customfield_10071').subscribe({
      next: (result) => {
        expect(result.missingQAPlan).toEqual(['STO-2', 'STO-3']);
      },
      complete: done
    });
  });
});
