import { Observable, from } from 'rxjs';
import { Keychain } from '../keys';

type GithubClient = {
  users: {
    getAuthenticated(): Promise<unknown>;
  };
};

type JiraClient = {
  getVersions(projectKey: string): Promise<unknown>;
};

type SlackClient = {
  auth: {
    test(): Promise<{ ok?: boolean; error?: string }>;
  };
};

export interface CheckKeysEndpointDependencies {
  readonly keychain: Keychain;
  octokit(): GithubClient;
  jiraAPI(): JiraClient;
  readonly slackWebClient: SlackClient;
  readonly slackAppWebClient: SlackClient;
}

export type CheckKeysEndpointInput = {
  jiraProjectKey?: string;
};

export type ServiceCheck = {
  configured: boolean;
  responding: boolean;
  error?: string;
};

export type CheckKeysEndpointResponse = {
  ok: boolean;
  jiraAuthType: string;
  services: {
    github: ServiceCheck;
    jira: ServiceCheck;
    slackBot: ServiceCheck;
    slackApp: ServiceCheck;
  };
};

export class CheckKeysEndpoint {
  private readonly dependencies: CheckKeysEndpointDependencies;

  constructor(dependencies: CheckKeysEndpointDependencies) {
    this.dependencies = dependencies;
  }

  execute(
    input: CheckKeysEndpointInput = {}
  ): Observable<CheckKeysEndpointResponse> {
    return from(this.checkServices(input));
  }

  private async checkServices(
    input: CheckKeysEndpointInput
  ): Promise<CheckKeysEndpointResponse> {
    const [github, jira, slackBot, slackApp] = await Promise.all([
      this.checkGithub(),
      this.checkJira(input),
      this.checkSlackBot(),
      this.checkSlackApp()
    ]);

    return {
      ok:
        github.responding &&
        jira.responding &&
        slackBot.responding &&
        slackApp.responding,
      jiraAuthType: this.dependencies.keychain.jiraAuthType,
      services: {
        github,
        jira,
        slackBot,
        slackApp
      }
    };
  }

  private async checkGithub(): Promise<ServiceCheck> {
    if (!this.isConfigured(this.dependencies.keychain.githubAuthToken)) {
      return this.missing('GITHUB_AUTH_TOKEN');
    }

    return this.checkService(() =>
      this.dependencies.octokit().users.getAuthenticated()
    );
  }

  private async checkJira(
    input: CheckKeysEndpointInput
  ): Promise<ServiceCheck> {
    const missingKeys = this.missingJiraKeys();
    if (missingKeys.length > 0) {
      return this.missing(missingKeys.join(', '));
    }

    if (
      this.dependencies.keychain.jiraAuthType !== 'regular' &&
      this.dependencies.keychain.jiraAuthType !== 'service'
    ) {
      return {
        configured: true,
        responding: false,
        error: 'JIRA_AUTH_TYPE must be either "regular" or "service".'
      };
    }

    if (!this.isConfigured(input.jiraProjectKey)) {
      return this.missing('jiraProjectKey query parameter');
    }

    return this.checkService(() =>
      this.dependencies.jiraAPI().getVersions(input.jiraProjectKey as string)
    );
  }

  private async checkSlackBot(): Promise<ServiceCheck> {
    if (!this.isConfigured(this.dependencies.keychain.slackAuthToken)) {
      return this.missing('SLACK_AUTH_TOKEN');
    }

    return this.checkSlackAuth(() =>
      this.dependencies.slackWebClient.auth.test()
    );
  }

  private async checkSlackApp(): Promise<ServiceCheck> {
    if (!this.isConfigured(this.dependencies.keychain.slackAppToken)) {
      return this.missing('SLACK_APP_TOKEN');
    }

    return this.checkSlackAuth(() =>
      this.dependencies.slackAppWebClient.auth.test()
    );
  }

  private async checkService(
    check: () => Promise<unknown>
  ): Promise<ServiceCheck> {
    try {
      await check();
      return {
        configured: true,
        responding: true
      };
    } catch (error) {
      return {
        configured: true,
        responding: false,
        error: this.errorMessage(error)
      };
    }
  }

  private async checkSlackAuth(
    check: () => Promise<{ ok?: boolean; error?: string }>
  ): Promise<ServiceCheck> {
    return this.checkService(async () => {
      const response = await check();
      if (response.ok === false) {
        throw new Error(response.error ?? 'Slack token rejected');
      }
    });
  }

  private missingJiraKeys(): string[] {
    const missingKeys: string[] = [];

    if (!this.isConfigured(this.dependencies.keychain.jiraAuthToken)) {
      missingKeys.push('JIRA_AUTH_TOKEN');
    }

    if (
      this.dependencies.keychain.jiraAuthType === 'service' &&
      !this.isConfigured(this.dependencies.keychain.jiraCloudId)
    ) {
      missingKeys.push('JIRA_CLOUD_ID');
    }

    if (
      this.dependencies.keychain.jiraAuthType !== 'service' &&
      !this.isConfigured(this.dependencies.keychain.jiraUserName)
    ) {
      missingKeys.push('JIRA_USER_NAME');
    }

    return missingKeys;
  }

  private missing(key: string): ServiceCheck {
    return {
      configured: false,
      responding: false,
      error: `Missing ${key}`
    };
  }

  private isConfigured(value: string | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
