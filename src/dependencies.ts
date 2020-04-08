import { TagEndpointDependencies } from './endpoints/tag-endpoint';
import {
  JiraTagUseCase,
  JiraMappers,
  JiraTagUseCaseDependencies
} from './use-cases/tag-use-case';
import {
  GithubPullRequestExtractor,
  ConcreteJiraTickerParser
} from './repositories/github-repository';
import { Keychain } from './keys';
import { Octokit } from '@octokit/rest';
import JiraAPI from 'jira-client';
import { ConcreteJiraTickerTagger } from './repositories/jira-tagger';
import { Config } from './configs';
import { CreateReleaseEndpointDependencies } from './endpoints/create-release-endpoint';
import { CreateReleaseUseCase } from './use-cases/create-release-use-case';
import { GithubCreateBranchUseCase } from './use-cases/create-branch-use-case';
import { GithubSHAFinder } from './repositories/sha-finder';
import { GithubBranchCreator } from './repositories/branch-creator';
import { GithubPullRequestCreator } from './repositories/pull-request-creator';

export class Dependencies
  implements
    TagEndpointDependencies,
    JiraTagUseCaseDependencies,
    CreateReleaseEndpointDependencies {
  keychain = new Keychain(process.env);
  config = new Config(process.env);

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

  commitExtractor = new GithubPullRequestExtractor(
    this.octokit(),
    this.config.githubOwner,
    this.config.githubRepo
  );
  jiraTicketParser = new ConcreteJiraTickerParser();
  jiraTicketTagger = new ConcreteJiraTickerTagger(this.jiraAPI());
  inputMapper = new JiraMappers();
  outputMapper = new JiraMappers();
  tagUseCase = new JiraTagUseCase(this);

  shaFinder = new GithubSHAFinder(
    this.octokit(),
    this.config.githubOwner,
    this.config.githubRepo
  );
  branchCreator = new GithubBranchCreator(
    this.octokit(),
    this.config.githubRepo,
    this.config.githubOwner
  );
  createBranchUseCase = new GithubCreateBranchUseCase(
    this.shaFinder,
    this.branchCreator
  );

  pullRequestCreator = new GithubPullRequestCreator(this.octokit(), this.config.githubOwner, this.config.githubRepo)
  createReleaseUseCase = new CreateReleaseUseCase(this.createBranchUseCase, this.pullRequestCreator);
}
