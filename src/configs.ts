import configJSON from './config.json';

export class Config {
  constructor(
    public jiraHost = configJSON.jira_host,
    public githubOwner = configJSON.github_owner,
    public confirmationEmoji = configJSON.confirmation_emoji,
    public secondsToConfirmationTimeout = configJSON.seconds_to_confirmation_timeout
  ) {}
}
