import { Issue } from '../../src/services/jira-service';
import { ConcreteIssuesStatusMessageBuilder } from '../../src/workers/issues-status-message-builder';
import { makeIssue } from './shared/make-issue';

const jiraHost = 'https://jiraHost.com';

describe('The issues status message builder', () => {
  it('builds a message for one issue and one project', () => {
    const issuesPerProjectKeyAndStatus = new Map<
      string,
      Map<string, Issue[]>
    >();
    const issuesPerStatus = new Map<string, Issue[]>();
    issuesPerStatus.set('in progress', [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key1', issuesPerStatus);
    const sut = new ConcreteIssuesStatusMessageBuilder(jiraHost);
    const result = sut.buildMessage(issuesPerProjectKeyAndStatus);
    expect(result).toBe(
      '*key1*\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary1>\n'
    );
  });

  it('builds a message for two issues and one project', () => {
    const issuesPerProjectKeyAndStatus = new Map<
      string,
      Map<string, Issue[]>
    >();
    const issuesPerStatus = new Map<string, Issue[]>();
    issuesPerStatus.set('in progress', [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key1', issuesPerStatus);
    const sut = new ConcreteIssuesStatusMessageBuilder(jiraHost);
    const result = sut.buildMessage(issuesPerProjectKeyAndStatus);
    expect(result).toBe(
      '*key1*\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary1>\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary2>\n'
    );
  });

  it('builds a message for two issues and two projects', () => {
    const issuesPerProjectKeyAndStatus = new Map<
      string,
      Map<string, Issue[]>
    >();
    const issuesPerStatus = new Map<string, Issue[]>();
    issuesPerStatus.set('in progress', [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key1', issuesPerStatus);
    const issuesPerStatus2 = new Map<string, Issue[]>();
    issuesPerStatus2.set('done', [
      makeIssue({
        summary: 'summary3',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'done' }
      }),
      makeIssue({
        summary: 'summary4',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'done' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key2', issuesPerStatus2);
    const sut = new ConcreteIssuesStatusMessageBuilder(jiraHost);
    const result = sut.buildMessage(issuesPerProjectKeyAndStatus);
    expect(result).toBe(
      '*key1*\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary1>\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary2>\n*key2*\n    •   🟢  <https://https://jiraHost.com/browse/key|key summary3>\n    •   🟢  <https://https://jiraHost.com/browse/key|key summary4>\n'
    );
  });

  it('builds a message for two issues and two projects and two statuses', () => {
    const issuesPerProjectKeyAndStatus = new Map<
      string,
      Map<string, Issue[]>
    >();
    const issuesPerStatus = new Map<string, Issue[]>();
    issuesPerStatus.set('in progress', [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'in progress' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key1', issuesPerStatus);
    const issuesPerStatus2 = new Map<string, Issue[]>();
    issuesPerStatus2.set('done', [
      makeIssue({
        summary: 'summary3',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'done' }
      }),
      makeIssue({
        summary: 'summary4',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'done' }
      })
    ]);
    issuesPerStatus2.set('in code review', [
      makeIssue({
        summary: 'summary5',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'in code review' }
      }),
      makeIssue({
        summary: 'summary6',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'in code review' }
      })
    ]);
    issuesPerProjectKeyAndStatus.set('key2', issuesPerStatus2);
    const sut = new ConcreteIssuesStatusMessageBuilder(jiraHost);
    const result = sut.buildMessage(issuesPerProjectKeyAndStatus);
    expect(result).toBe(
      '*key1*\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary1>\n    •   🔴  <https://https://jiraHost.com/browse/key|key summary2>\n*key2*\n    •   🟢  <https://https://jiraHost.com/browse/key|key summary3>\n    •   🟢  <https://https://jiraHost.com/browse/key|key summary4>\n    •   🟠  <https://https://jiraHost.com/browse/key|key summary5>\n    •   🟠  <https://https://jiraHost.com/browse/key|key summary6>\n'
    );
  });
});
