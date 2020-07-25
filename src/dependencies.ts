import { TagEndpointDependencies } from './endpoints/tag-endpoint';
import {
  JiraTagUseCase,
  JiraTagUseCaseDependencies
} from './use-cases/tag-use-case';
import { GithubPullRequestExtractor } from './workers/commit-extractor';
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
import { GithubNextReleaseGuesser } from './workers/next-release-guesser';
import { ConcreteJiraTickerParser } from './workers/jira-ticket-parser';
import { ConcreteGithubService } from './services/github-service';
import { ConcreteJiraService } from './services/jira-service';
import { JiraCreateVersionUseCase } from './use-cases/create-version-use-case';

export class Dependencies
  implements
    TagEndpointDependencies,
    JiraTagUseCaseDependencies,
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

  commitExtractor = new GithubPullRequestExtractor(
    this.octokit(),
    this.config.githubOwner
  );
  jiraTicketParser = new ConcreteJiraTickerParser();
  jiraTicketTagger = new ConcreteJiraTickerTagger(this.jiraAPI());
  createVersionUseCase = new JiraCreateVersionUseCase(this.jiraService);
  tagUseCase = new JiraTagUseCase(this);

  shaFinder = new GithubSHAFinder(this.octokit(), this.config.githubOwner);
  branchCreator = new GithubBranchCreator(
    this.octokit(),
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
  createReleaseUseCase = new CreateReleaseUseCase(
    this.createBranchUseCase,
    this.pullRequestCreator,
    this.tagUseCase
  );

  messageSender = new SlackMessageSender(this.slackWebClient);
  reactionsReader = new SlackReactionsReader(this.slackWebClient);
  nextReleaseGuesser = new GithubNextReleaseGuesser(
    this.githubService,
    this.config.githubOwner
  );

  startTrainUseCase = new StartTrainUseCase(
    this.messageSender,
    this.reactionsReader,
    this.nextReleaseGuesser,
    this.createReleaseUseCase,
    this.config.newBranchPrefix,
    this.config.releaseBaseBranch,
    this.config.releaseTargetBranch,
    this.config.pullRequestTitlePrefix,
    this.config.secondsToConfirmationTimeout,
    this.config.jiraProjectName
  );

  project = this.config.jiraProjectName;
}
