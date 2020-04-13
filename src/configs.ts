import configJSON from './config.json';

export class Config {
  jiraHost: string;
  githubRepo: string;
  githubOwner: string;
  confirmationEmoji: string;
  releaseTargetBranch: string;
  releaseBaseBranch: string;
  newBranchPrefix: string;
  channelToConfirm: string;
  pullRequestTitlePrefix: string;
  secondsToConfirmationTimeout: number;

  constructor() {
    this.jiraHost = configJSON.jira_host;
    this.githubRepo = configJSON.github_repo;
    this.githubOwner = configJSON.github_owner;
    this.confirmationEmoji = configJSON.confirmation_emoji;
    this.releaseTargetBranch = configJSON.release_target_branch;
    this.releaseBaseBranch = configJSON.release_base_branch;
    this.newBranchPrefix = configJSON.new_branch_prefix;
    this.channelToConfirm = configJSON.channel_to_confirm;
    this.pullRequestTitlePrefix = configJSON.pull_request_title_prefix;
    this.secondsToConfirmationTimeout =
      configJSON.seconds_to_confirmation_timeout;
  }
}
