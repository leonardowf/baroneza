import { TagEndpointDependencies } from './endpoints/tag-endpoint';
import { JiraTagUseCase } from './use-cases/tag-use-case';
import {
  GithubPullRequestExtractor,
  GithubShaExtractor
} from './workers/commit-extractor';
import { Keychain } from './keys';
import { Octokit } from '@octokit/rest';
import JiraAPI from 'jira-client';
import { ConcreteJiraTickerTagger } from './workers/jira-tagger';
import { Config } from './configs';
import { CreateReleaseEndpointDependencies } from './endpoints/create-release-endpoint';
import { CreateReleaseUseCase } from './use-cases/create-release-use-case';
import { GithubCreateBranchUseCase } from './use-cases/create-branch-use-case';
import { GithubSHAFinder } from './workers/sha-finder';
import { GithubBranchCreator } from './workers/branch-creator';
import { GithubPullRequestCreator } from './workers/pull-request-creator';
import { StartTrainDependencies } from './endpoints/start-train-endpoint';
import { StartTrainUseCase } from './use-cases/start-train-use-case';
import { SlackMessageSender } from './workers/message-sender';
import { WebClient } from '@slack/web-api';
import { SlackReactionsReader } from './workers/reactions-reader';
import { ConcreteJiraTickerParser } from './workers/jira-ticket-parser';
import { ConcreteGithubService } from './services/github-service';
import { ConcreteJiraService } from './services/jira-service';
import { JiraCreateVersionUseCase } from './use-cases/create-version-use-case';
import { GithubCreateChangelogUseCase } from './use-cases/create-changelog-use-case';
import { GithubPullRequestNumberExtractor } from './workers/pr-number-extractor';
import { GithubPullRequestInfoUseCase } from './use-cases/read-pull-request-info-use-case';
import { ConcreteKeepChangelogParser } from './workers/keep-changelog-parser';
import { GithubReleasePageCreator } from './workers/release-page-creator';
import { GithubPullRequestDescriptionWriter } from './workers/pull-request-description-writer';
import { SlackAskConfirmationUseCase } from './use-cases/ask-confirmation-use-case';
import { GithubCreateMilestoneUseCase } from './use-cases/create-milestone-use-case';
import { GithubMilestoneCreator } from './workers/milestone-creator';
import { MarkdownKeepChangelogBuilder } from './workers/keep-changelog-builder/markdown-keep-changelog-builder';
import { SlackKeepChangelogBuilder } from './workers/keep-changelog-builder/slack-keep-changelog-builder';
import { GithubMergeBackUseCase } from './use-cases/merge-back-use-case';
import { ConcreteExtractTicketsUseCase } from './use-cases/extract-tickets-use-case';
import { ConcreteCommitPRNumberParser } from './workers/keep-changelog-builder/commits-pr-number-parser';
import { ConcreteUpdateReleaseUseCase } from './use-cases/update-release-use-case';
import { GithubDraftReleaseGuesser } from './workers/github-draft-release-guesser';

export class Dependencies
  implements
    TagEndpointDependencies,
    CreateReleaseEndpointDependencies,
    StartTrainDependencies {
  keychain = new Keychain(process.env);
  config = new Config();

  octokit = (): Octokit =>
    new Octokit({
      auth: this.keychain.githubAuthToken
    });

  jiraAPI = (): JiraAPI =>
    new JiraAPI({
      host: this.config.jiraHost,
      protocol: 'https',
      username: this.keychain.jiraUserName,
      password: this.keychain.jiraAuthToken
    });

  githubService = new ConcreteGithubService(this.octokit());
  jiraService = new ConcreteJiraService(this.jiraAPI());
  slackWebClient = new WebClient(this.keychain.slackAuthToken);

  pullRequestCommitExtractor = new GithubPullRequestExtractor(
    this.githubService,
    this.config.githubOwner
  );
  shaCommitExtractor = new GithubShaExtractor(
    this.githubService,
    this.config.githubOwner
  );
  jiraTicketParser = new ConcreteJiraTickerParser();
  jiraTicketTagger = new ConcreteJiraTickerTagger(this.jiraAPI());
  createVersionUseCase = new JiraCreateVersionUseCase(this.jiraService);
  extractTicketsUseCase = new ConcreteExtractTicketsUseCase(
    this.pullRequestCommitExtractor,
    this.shaCommitExtractor,
    this.jiraTicketParser
  );
  tagUseCase = new JiraTagUseCase(
    this.extractTicketsUseCase,
    this.jiraTicketTagger,
    this.createVersionUseCase
  );

  shaFinder = new GithubSHAFinder(this.githubService, this.config.githubOwner);
  branchCreator = new GithubBranchCreator(
    this.githubService,
    this.config.githubOwner
  );
  createBranchUseCase = new GithubCreateBranchUseCase(
    this.shaFinder,
    this.branchCreator
  );

  pullRequestCreator = new GithubPullRequestCreator(
    this.octokit(),
    this.config.githubOwner
  );

  commitPRNumberParser = new ConcreteCommitPRNumberParser();

  pullRequestNumberExtractor = new GithubPullRequestNumberExtractor(
    this.pullRequestCommitExtractor,
    this.commitPRNumberParser
  );

  pullRequestInfoUseCase = new GithubPullRequestInfoUseCase(
    this.githubService,
    this.config.githubOwner
  );

  keepChangelogParser = new ConcreteKeepChangelogParser();
  markdownKeepChangelogBuilder = new MarkdownKeepChangelogBuilder();
  blocksKeepChangelogBuilder = new SlackKeepChangelogBuilder();

  createChangeLogUseCase = new GithubCreateChangelogUseCase(
    this.blocksKeepChangelogBuilder,
    this.commitPRNumberParser,
    this.markdownKeepChangelogBuilder,
    this.keepChangelogParser,
    this.pullRequestInfoUseCase,
    this.pullRequestNumberExtractor
  );

  releasePageCreator = new GithubReleasePageCreator(
    this.githubService,
    this.config.githubOwner
  );
  pullRequestDescriptionWriter = new GithubPullRequestDescriptionWriter(
    this.githubService,
    this.config.githubOwner
  );

  messageSender = new SlackMessageSender(this.slackWebClient);

  milestoneCreator = new GithubMilestoneCreator(
    this.githubService,
    this.config.githubOwner
  );

  createMilestoneUseCase = new GithubCreateMilestoneUseCase(
    this.config.githubOwner,
    this.pullRequestNumberExtractor,
    this.milestoneCreator,
    this.githubService
  );

  createReleaseUseCase = new CreateReleaseUseCase(
    this.createBranchUseCase,
    this.pullRequestCreator,
    this.tagUseCase,
    this.createChangeLogUseCase,
    this.releasePageCreator,
    this.pullRequestDescriptionWriter,
    this.messageSender,
    this.createMilestoneUseCase
  );

  reactionsReader = new SlackReactionsReader(this.slackWebClient);
  nextReleaseGuesser = new GithubDraftReleaseGuesser(
    this.githubService,
    this.config.githubOwner
  );

  askConfirmationUseCase = new SlackAskConfirmationUseCase(
    this.messageSender,
    this.reactionsReader,
    this.config.confirmationEmoji,
    this.config.secondsToConfirmationTimeout
  );

  startTrainUseCase = new StartTrainUseCase({
    nextReleaseGuesser: this.nextReleaseGuesser,
    createReleaseUseCase: this.createReleaseUseCase,
    askConfirmationUseCase: this.askConfirmationUseCase,
    confirmationReaction: this.config.confirmationEmoji,
    secondsToConfirmationTimeout: this.config.secondsToConfirmationTimeout
  });

  updateReleaseUseCase = new ConcreteUpdateReleaseUseCase({
    createChangelogUseCase: this.createChangeLogUseCase,
    createMilestoneUseCase: this.createMilestoneUseCase,
    extractTicketsUseCase: this.extractTicketsUseCase,
    githubService: this.githubService,
    jiraService: this.jiraService,
    owner: this.config.githubOwner,
    slackMessageSender: this.messageSender,
    tagUseCase: this.tagUseCase
  });

  mergeBackUseCase = new GithubMergeBackUseCase(
    this.config.githubOwner,
    this.pullRequestCreator,
    this.githubService
  );
}
