import { Issue } from '../services/jira-service';

export interface IssuesStatusMessageBuilder {
  buildMessage(
    issuesPerProjectKeyAndStatus: Map<string, Map<string, Issue[]>>
  ): string;
}

export class ConcreteIssuesStatusMessageBuilder
  implements IssuesStatusMessageBuilder {
  private readonly jiraHost: string;

  constructor(jiraHost: string) {
    this.jiraHost = jiraHost;
  }

  buildMessage(
    issuesPerProjectKeyAndStatus: Map<string, Map<string, Issue[]>>
  ): string {
    let message = '';

    issuesPerProjectKeyAndStatus.forEach((issuesPerStatus, projectKey) => {
      message += `*${projectKey}*\n`;

      issuesPerStatus.forEach((issues, status) => {
        const emojiForStatus = this.emojiForStatus(status);

        issues.forEach((issue) => {
          message += `    •   ${emojiForStatus}  ${this.makeJiraLink(issue)}\n`;
        });
      });
    });

    return message;
  }

  private makeJiraLink(issue: Issue): string {
    return `<https://${this.jiraHost}/browse/${issue.key}|${issue.key} ${issue.fields.summary}>`;
  }

  private emojiForStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'verified':
        return '🟢';
      case 'done':
        return '🟢';
      case 'ready for test':
        return '🟡';
      case 'in code review':
        return '🟠';
      case 'in progress':
        return '🔴';
      case 'blocked':
        return '⛔️';
      case 'backlog':
        return '🔴';
      default:
        return '❓';
    }
  }
}
