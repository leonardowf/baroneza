import { Issue } from '../../src/services/jira-service';
import { ConcreteIssuesOrganizer } from '../../src/workers/issues-organizer';
import { makeIssue } from './shared/make-issue';

describe('The issues organizer', () => {
  it('groups issues by project key', () => {
    const issues: Issue[] = [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' }
      })
    ];
    const sut = new ConcreteIssuesOrganizer();
    const result = sut.organize(issues, ['status'], ['key1']);

    expect(result.get('key1')?.get('status')?.length).toBe(2);
  });

  it('sorts issues by status', () => {
    const issues: Issue[] = [
      makeIssue({
        summary: 'summary2',
        status: { name: 'status2' }
      }),
      makeIssue({
        summary: 'summary1',
        status: { name: 'status1' }
      }),
      makeIssue({
        summary: 'summary3',
        status: { name: 'status3' }
      })
    ];
    const sut = new ConcreteIssuesOrganizer();
    const result = sut.organize(
      issues,
      ['status1', 'status2', 'status3'],
      ['key']
    );

    expect(result.get('key')?.get('status1')?.[0].fields.summary).toBe(
      'summary1'
    );
    expect(result.get('key')?.get('status2')?.[0].fields.summary).toBe(
      'summary2'
    );
    expect(result.get('key')?.get('status3')?.[0].fields.summary).toBe(
      'summary3'
    );
  });

  it('groups issues by project key and sorts them by status', () => {
    const issues = [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'status1' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'status2' }
      }),
      makeIssue({
        summary: 'summary3',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'status1' }
      }),
      makeIssue({
        summary: 'summary4',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'status2' }
      })
    ];

    const sut = new ConcreteIssuesOrganizer();
    const result = sut.organize(
      issues,
      ['status2', 'status1'],
      ['key1', 'key2']
    );

    expect(result.get('key1')?.get('status2')?.[0].fields.summary).toBe(
      'summary2'
    );
    expect(result.get('key1')?.get('status1')?.[0].fields.summary).toBe(
      'summary1'
    );
    expect(result.get('key2')?.get('status2')?.[0].fields.summary).toBe(
      'summary4'
    );
    expect(result.get('key2')?.get('status1')?.[0].fields.summary).toBe(
      'summary3'
    );
  });

  it('filters issues by project key', () => {
    const issues: Issue[] = [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key2', name: 'name2' }
      })
    ];
    const sut = new ConcreteIssuesOrganizer();
    const result = sut.organize(issues, ['status'], ['key1']);

    expect(result.get('key1')?.get('status')?.length).toBe(1);
    expect(result.get('key2')?.get('status')?.length ?? 0).toBe(0);
  });

  it('groups issues by status and project key', () => {
    const issues = [
      makeIssue({
        summary: 'summary1',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'status1' }
      }),
      makeIssue({
        summary: 'summary2',
        project: { key: 'key1', name: 'name1' },
        status: { name: 'status2' }
      }),
      makeIssue({
        summary: 'summary3',
        project: { key: 'key2', name: 'name2' },
        status: { name: 'status1' }
      }),
      makeIssue({
        summary: 'summary4',

        project: { key: 'key2', name: 'name2' },
        status: { name: 'status2' }
      })
    ];

    const sut = new ConcreteIssuesOrganizer();
    const result = sut.organize(
      issues,
      ['status1', 'status2'],
      ['key1', 'key2']
    );

    expect(result.get('key1')?.get('status1')?.[0].fields.summary).toBe(
      'summary1'
    );
    expect(result.get('key1')?.get('status2')?.[0].fields.summary).toBe(
      'summary2'
    );
    expect(result.get('key2')?.get('status1')?.[0].fields.summary).toBe(
      'summary3'
    );
    expect(result.get('key2')?.get('status2')?.[0].fields.summary).toBe(
      'summary4'
    );
  });
});
