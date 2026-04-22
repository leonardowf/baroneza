import { Keychain } from '../src/keys';

const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  GITHUB_AUTH_TOKEN: 'github-token',
  JIRA_AUTH_TOKEN: 'jira-token',
  JIRA_USER_NAME: 'jira-user',
  SLACK_AUTH_TOKEN: 'slack-token',
  JIRA_HOST: 'example.atlassian.net'
};

describe('Keychain', () => {
  describe('jiraAuthType', () => {
    it('defaults to "regular" when JIRA_AUTH_TYPE is not set', () => {
      const keychain = new Keychain({ ...baseEnv });
      expect(keychain.jiraAuthType).toBe('regular');
    });

    it('is "regular" when JIRA_AUTH_TYPE is explicitly "regular"', () => {
      const keychain = new Keychain({ ...baseEnv, JIRA_AUTH_TYPE: 'regular' });
      expect(keychain.jiraAuthType).toBe('regular');
    });

    it('is "service" when JIRA_AUTH_TYPE is "service"', () => {
      const keychain = new Keychain({ ...baseEnv, JIRA_AUTH_TYPE: 'service' });
      expect(keychain.jiraAuthType).toBe('service');
    });
  });

  describe('jiraCloudId', () => {
    it('is undefined when JIRA_CLOUD_ID is not set', () => {
      const keychain = new Keychain({ ...baseEnv });
      expect(keychain.jiraCloudId).toBeUndefined();
    });

    it('is set when JIRA_CLOUD_ID is provided', () => {
      const keychain = new Keychain({ ...baseEnv, JIRA_CLOUD_ID: 'abc123' });
      expect(keychain.jiraCloudId).toBe('abc123');
    });
  });
});
