import { SlackCommand, SlackCommandContext } from './slack-command';
import { MergedPRTicketExtractor } from '../workers/merged-pr-ticket-extractor';
import { QAPlanChecker } from '../workers/qa-plan-checker';
import { QAPlanMessageBuilder } from '../workers/qa-plan-message-builder';
import { Config } from '../configs';
import { DeploymentContextStore } from '../store/deployment-context-store';
import { StartTrainUseCase } from '../use-cases/start-train-use-case';
import { SlackCommandTriggers } from '../constants/slack-command-triggers';

export type StartTrainCommandDependencies = {
  startTrainUseCase: StartTrainUseCase;
  mergedPRTicketExtractor: MergedPRTicketExtractor;
  qaPlanChecker: QAPlanChecker;
  qaPlanMessageBuilder: QAPlanMessageBuilder;
  config: Config;
  deploymentContextStore: DeploymentContextStore;
};

export class StartTrainCommand implements SlackCommand {
  private readonly startTrainUseCase: StartTrainUseCase;
  private readonly mergedPRTicketExtractor: MergedPRTicketExtractor;
  private readonly qaPlanChecker: QAPlanChecker;
  private readonly qaPlanMessageBuilder: QAPlanMessageBuilder;
  private readonly config: Config;
  private readonly deploymentContextStore: DeploymentContextStore;

  constructor(dependencies: StartTrainCommandDependencies) {
    this.startTrainUseCase = dependencies.startTrainUseCase;
    this.mergedPRTicketExtractor = dependencies.mergedPRTicketExtractor;
    this.qaPlanChecker = dependencies.qaPlanChecker;
    this.qaPlanMessageBuilder = dependencies.qaPlanMessageBuilder;
    this.config = dependencies.config;
    this.deploymentContextStore = dependencies.deploymentContextStore;
  }

  matches(text: string): boolean {
    return new RegExp(SlackCommandTriggers.START_TRAIN, 'i').test(text);
  }

  async execute(context: SlackCommandContext): Promise<void> {
    const deploymentContext = this.deploymentContextStore.get();
    if (!deploymentContext) {
      await context.replyInThread(
        ':x: No release readiness check has been run. Please wait for the next run.'
      );
      return;
    }

    const ticketIds = await this.mergedPRTicketExtractor
      .extract(deploymentContext.repository, deploymentContext.baseBranch)
      .toPromise();

    const { missingQAPlan } = await this.qaPlanChecker
      .check(ticketIds ?? [], deploymentContext.qaPlanFieldId)
      .toPromise();

    if (missingQAPlan.length > 0) {
      const blocks = this.qaPlanMessageBuilder.build(
        missingQAPlan,
        this.config.jiraHost
      );
      await context.replyWithBlocks(
        blocks,
        ':warning: QA plan missing — deployment blocked.'
      );
      return;
    }

    await this.startTrainUseCase
      .execute({
        baseBranch: deploymentContext.baseBranch,
        branchPrefix: deploymentContext.branchPrefix,
        channel: deploymentContext.channel,
        projectKeys: deploymentContext.projectKeys,
        jiraTagSuffix: '',
        pullRequestTitlePrefix: deploymentContext.pullRequestTitlePrefix,
        releaseType: deploymentContext.releaseType,
        repository: deploymentContext.repository,
        targetBranch: deploymentContext.targetBranch,
        threadToReply: context.threadToReply
      })
      .toPromise();
  }
}
