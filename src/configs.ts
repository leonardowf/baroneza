import configJSON from './config.json';

export class Config {
  constructor(
    public jiraHost = configJSON.jira_host,
    public githubOwner = configJSON.github_owner,
    public confirmationEmoji = configJSON.confirmation_emoji,
    public releaseTargetBranch = configJSON.release_target_branch,
    public releaseBaseBranch = configJSON.release_base_branch,
    public newBranchPrefix = configJSON.new_branch_prefix,
    public pullRequestTitlePrefix = configJSON.pull_request_title_prefix,
    public secondsToConfirmationTimeout = configJSON.seconds_to_confirmation_timeout,
    public jiraProjectName = configJSON.jira_project_name
  ) {}
}
