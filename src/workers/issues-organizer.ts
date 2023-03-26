import { Issue } from '../services/jira-service';

export interface IssuesOrganizer {
  organize(
    issues: Issue[],
    status: string[],
    projectKeys: string[]
  ): Map<string, Map<string, Issue[]>>;
}

export class ConcreteIssuesOrganizer implements IssuesOrganizer {
  organize(
    issues: Issue[],
    status: string[],
    projectKeys: string[]
  ): Map<string, Map<string, Issue[]>> {
    const filteredByProjectKeys = this.filterIssuesByProjectKeys(
      issues,
      projectKeys
    );
    const filteredByStatus = this.filterIssuesByStatus(
      filteredByProjectKeys,
      status
    );

    const sortedIssues = this.sortIssuesByStatus(filteredByStatus, status);

    const groupedByProjectKeys = this.groupIssuesByProjectKey(sortedIssues);

    return this.groupIssuesByStatusAndProjectKey(groupedByProjectKeys);
  }

  private filterIssuesByStatus(issues: Issue[], statuses: string[]): Issue[] {
    return issues.filter((issue) =>
      statuses
        .map((value) => value.toLowerCase().trim())
        .includes(issue.fields.status.name.toLowerCase().trim())
    );
  }

  private filterIssuesByProjectKeys(
    issues: Issue[],
    projectKeys: string[]
  ): Issue[] {
    return issues.filter((issue) =>
      projectKeys
        .map((value) => value.toLowerCase().trim())
        .includes(issue.fields.project.key.toLowerCase().trim())
    );
  }

  private groupIssuesByProjectKey(issues: Issue[]): Map<string, Issue[]> {
    const issuesByProjectKey = new Map<string, Issue[]>();

    issues.forEach((issue) => {
      const projectKey = issue.fields.project.key;
      const existingIssues = issuesByProjectKey.get(projectKey);
      if (existingIssues) {
        existingIssues.push(issue);
        issuesByProjectKey.set(projectKey, existingIssues);
      } else {
        issuesByProjectKey.set(projectKey, [issue]);
      }
    });

    return issuesByProjectKey;
  }

  private sortIssuesByStatus(issues: Issue[], statuses: string[]): Issue[] {
    return issues.sort((a, b) => {
      const aStatusIndex = statuses.indexOf(a.fields.status.name);
      const bStatusIndex = statuses.indexOf(b.fields.status.name);

      return aStatusIndex - bStatusIndex;
    });
  }

  private groupIssuesByStatus(issues: Issue[]): Map<string, Issue[]> {
    const issuesByStatus = new Map<string, Issue[]>();

    issues.forEach((issue) => {
      const status = issue.fields.status.name;
      const existingIssues = issuesByStatus.get(status);
      if (existingIssues) {
        existingIssues.push(issue);
        issuesByStatus.set(status, existingIssues);
      } else {
        issuesByStatus.set(status, [issue]);
      }
    });

    return issuesByStatus;
  }

  private groupIssuesByStatusAndProjectKey(
    issuesByProjectKey: Map<string, Issue[]>
  ): Map<string, Map<string, Issue[]>> {
    const issuesByStatusAndProjectKey = new Map<string, Map<string, Issue[]>>();

    issuesByProjectKey.forEach((issues, projectKey) => {
      const issuesByStatus = this.groupIssuesByStatus(issues);
      issuesByStatusAndProjectKey.set(projectKey, issuesByStatus);
    });

    return issuesByStatusAndProjectKey;
  }
}
