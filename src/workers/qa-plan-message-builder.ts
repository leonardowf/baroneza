import { SlackBlock } from '../commands/slack-command';

export interface QAPlanMessageBuilder {
  build(missingTickets: string[], jiraHost: string): SlackBlock[];
}

export class ConcreteQAPlanMessageBuilder implements QAPlanMessageBuilder {
  build(missingTickets: string[], jiraHost: string): SlackBlock[] {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':warning: QA PLAN MISSING — DEPLOYMENT BLOCKED',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            'The following Jira tickets are missing a QA plan. Fill them in and mention me again to proceed.'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: missingTickets
            .map((t) => `• https://${jiraHost}/browse/${t}`)
            .join('\n')
        }
      }
    ];
  }
}
