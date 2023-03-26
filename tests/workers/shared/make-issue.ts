import {
  FixVersion,
  Issue,
  Project,
  Status
} from '../../../src/services/jira-service';

export const makeIssue = (p: {
  summary?: string | undefined;
  fixVersions?: FixVersion[] | undefined;
  project?: Project | undefined;
  status?: Status | undefined;
}): Issue => {
  return {
    key: 'key',
    fields: {
      summary: p.summary ?? 'summary',
      project: p.project ?? {
        key: 'key',
        name: 'name'
      },
      status: p.status ?? {
        name: 'status'
      },
      fixVersions: p.fixVersions ?? [
        {
          name: 'version'
        }
      ]
    }
  };
};
