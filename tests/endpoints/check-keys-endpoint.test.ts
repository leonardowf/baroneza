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
    getVersions: jest.fn().mockResolvedValue([])
  }),
  slackWebClient: {
    auth: {
      test: jest.fn().mockResolvedValue({ ok: true })
    },
    chat: {
      postMessage: jest.fn().mockResolvedValue({ ok: true })
    }
  },
  slackAppWebClient: {
    auth: {
      test: jest.fn().mockResolvedValue({ ok: true })
    },
    apps: {
      connections: {
        open: jest.fn().mockResolvedValue({
          ok: true,
          url: 'wss://socket-mode-url'
        })
      }
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
      .execute({ jiraProjectKey: 'ABC' })
      .subscribe((response) => {
        expect(response.ok).toBe(true);
        expect(response.services.github.responding).toBe(true);
        expect(response.services.jira.responding).toBe(true);
        expect(response.services.slackBot.responding).toBe(true);
        expect(response.services.slackApp.responding).toBe(true);
        expect(response.services.slackSocketMode.responding).toBe(true);
        done();
      });
  });

  it('sends a safe Slack pong when a channel is provided', (done) => {
    const postMessage = jest.fn().mockResolvedValue({ ok: true });

    buildEndpoint(regularEnv, {
      slackWebClient: {
        auth: {
          test: jest.fn().mockResolvedValue({ ok: true })
        },
        chat: {
          postMessage
        }
      }
    })
      .execute({ jiraProjectKey: 'ABC', slackChannel: 'C123' })
      .subscribe((response) => {
        expect(response.ok).toBe(true);
        expect(response.slackPing).toEqual({
          configured: true,
          responding: true
        });
        expect(postMessage).toHaveBeenCalledWith({
          channel: 'C123',
          text: expect.stringContaining('Baroneza /checkKeys pong')
        });

        const text = postMessage.mock.calls[0][0].text;
        expect(text).toContain('jiraProjectKey: ABC');
        expect(text).toContain('slackChannel: C123');
        expect(text).toContain('slackSocketMode: responding');
        expect(text).not.toContain('github-token');
        expect(text).not.toContain('jira-token');
        expect(text).not.toContain('slack-token');
        expect(text).not.toContain('slack-app-token');
        done();
      });
  });

  it('reports Slack Socket Mode failures without returning the socket URL', (done) => {
    const open = jest.fn().mockResolvedValue({
      ok: false,
      error: 'not_allowed_token_type',
      url: 'wss://socket-mode-url'
    });

    buildEndpoint(regularEnv, {
      slackAppWebClient: {
        auth: {
          test: jest.fn().mockResolvedValue({ ok: true })
        },
        apps: {
          connections: {
            open
          }
        }
      }
    })
      .execute({ jiraProjectKey: 'ABC' })
      .subscribe((response) => {
        expect(response.ok).toBe(false);
        expect(response.services.slackSocketMode).toEqual({
          configured: true,
          responding: false,
          error: 'not_allowed_token_type'
        });
        expect(JSON.stringify(response)).not.toContain('wss://socket-mode-url');
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
      .execute({ jiraProjectKey: 'ABC' })
      .subscribe((response) => {
        expect(response.ok).toBe(true);
        expect(response.jiraAuthType).toBe('service');
        expect(response.services.jira.responding).toBe(true);
        done();
      });
  });

  it('requires a Jira project key for the Jira service check', (done) => {
    const getVersions = jest.fn().mockResolvedValue([]);

    buildEndpoint(regularEnv, {
      jiraAPI: () => ({
        getVersions
      })
    })
      .execute()
      .subscribe((response) => {
        expect(response.ok).toBe(false);
        expect(response.services.jira).toEqual({
          configured: false,
          responding: false,
          error: 'Missing jiraProjectKey query parameter'
        });
        expect(getVersions).not.toHaveBeenCalled();
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
          },
          apps: {
            connections: {
              open: jest.fn().mockResolvedValue({ ok: true })
            }
          }
        }
      }
    )
      .execute({ jiraProjectKey: 'ABC' })
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
      .execute({ jiraProjectKey: 'ABC' })
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
        },
        chat: {
          postMessage: jest.fn().mockResolvedValue({ ok: true })
        }
      }
    })
      .execute({ jiraProjectKey: 'ABC' })
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
