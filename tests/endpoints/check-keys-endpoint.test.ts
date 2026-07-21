import {
  CheckKeysEndpoint,
  CheckKeysEndpointDependencies
} from '../../src/endpoints/check-keys-endpoint';
import { Keychain } from '../../src/keys';

const regularEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  GITHUB_AUTH_TOKEN: 'github-token',
  JIRA_AUTH_TOKEN: 'jira-token',
  JIRA_HOST: 'example.atlassian.net',
  JIRA_USER_NAME: 'jira-user',
  SLACK_AUTH_TOKEN: 'slack-token',
  SLACK_APP_TOKEN: 'slack-app-token'
};

const dependencies = (
  env: NodeJS.ProcessEnv,
  overrides: Partial<CheckKeysEndpointDependencies> = {}
): CheckKeysEndpointDependencies => ({
  keychain: new Keychain(env),
  octokit: (): ReturnType<CheckKeysEndpointDependencies['octokit']> => ({
    users: {
      getAuthenticated: jest.fn().mockResolvedValue({})
    }
  }),
  jiraAPI: (): ReturnType<CheckKeysEndpointDependencies['jiraAPI']> => ({
    getCurrentUser: jest.fn().mockResolvedValue({})
  }),
  slackWebClient: {
    auth: {
      test: jest.fn().mockResolvedValue({ ok: true })
    }
  },
  slackAppWebClient: {
    auth: {
      test: jest.fn().mockResolvedValue({ ok: true })
    }
  },
  ...overrides
});

const buildEndpoint = (
  env: NodeJS.ProcessEnv,
  overrides: Partial<CheckKeysEndpointDependencies> = {}
): CheckKeysEndpoint => new CheckKeysEndpoint(dependencies(env, overrides));

describe('The check keys endpoint', () => {
  it('returns ok when all services respond', (done) => {
    buildEndpoint(regularEnv)
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(true);
        expect(response.services.github.responding).toBe(true);
        expect(response.services.jira.responding).toBe(true);
        expect(response.services.slackBot.responding).toBe(true);
        expect(response.services.slackApp.responding).toBe(true);
        done();
      });
  });

  it('uses Jira cloud id for service auth', (done) => {
    buildEndpoint({
      ...regularEnv,
      JIRA_AUTH_TYPE: 'service',
      JIRA_USER_NAME: '',
      JIRA_CLOUD_ID: 'cloud-id'
    })
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(true);
        expect(response.jiraAuthType).toBe('service');
        expect(response.services.jira.responding).toBe(true);
        done();
      });
  });

  it('does not call services with missing required keys', (done) => {
    const slackAppAuthTest = jest.fn().mockResolvedValue({ ok: true });

    buildEndpoint(
      {
        ...regularEnv,
        SLACK_APP_TOKEN: ''
      },
      {
        slackAppWebClient: {
          auth: {
            test: slackAppAuthTest
          }
        }
      }
    )
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(false);
        expect(response.services.slackApp).toEqual({
          configured: false,
          responding: false,
          error: 'Missing SLACK_APP_TOKEN'
        });
        expect(slackAppAuthTest).not.toHaveBeenCalled();
        done();
      });
  });

  it('reports service failures', (done) => {
    buildEndpoint(regularEnv, {
      octokit: (): ReturnType<CheckKeysEndpointDependencies['octokit']> => ({
        users: {
          getAuthenticated: jest
            .fn()
            .mockRejectedValue(new Error('Bad credentials'))
        }
      })
    })
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(false);
        expect(response.services.github).toEqual({
          configured: true,
          responding: false,
          error: 'Bad credentials'
        });
        done();
      });
  });

  it('reports Slack token rejection responses', (done) => {
    buildEndpoint(regularEnv, {
      slackWebClient: {
        auth: {
          test: jest
            .fn()
            .mockResolvedValue({ ok: false, error: 'invalid_auth' })
        }
      }
    })
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(false);
        expect(response.services.slackBot).toEqual({
          configured: true,
          responding: false,
          error: 'invalid_auth'
        });
        done();
      });
  });
});
