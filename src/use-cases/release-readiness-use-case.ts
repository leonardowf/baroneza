import { Observable, from, throwError } from 'rxjs';
import { catchError, flatMap, mapTo, tap } from 'rxjs/operators';
import { KnownMessageType, MessageSender } from '../workers/message-sender';
import { ReleaseReadinessBuilder } from '../workers/release-readiness-builder';
import { UnmergedPRsFetcher } from '../workers/unmerged-prs-fetcher';
import { DeploymentContextStore } from '../store/deployment-context-store';
import { MergedPRTicketExtractor } from '../workers/merged-pr-ticket-extractor';
import { QAPlanChecker } from '../workers/qa-plan-checker';
import { QAPlanMessageBuilder } from '../workers/qa-plan-message-builder';
import { ReleaseType } from '../workers/next-release-guesser';

export type ReleaseReadinessInput = {
  readonly channel: string;
  readonly baseBranch: string;
  readonly repository: string;
  readonly targetBranch: string;
  readonly branchPrefix: string;
  readonly projectKeys: string[];

  readonly pullRequestTitlePrefix: string;
  readonly releaseType: ReleaseType;
  readonly qaPlanFieldId: string;
};

export type ReleaseReadinessOutput = {};

export interface ReleaseReadinessUseCaseDependencies {
  readonly unmergedPRsFetcher: UnmergedPRsFetcher;
  readonly releaseReadinessBuilder: ReleaseReadinessBuilder;
  readonly messageSender: MessageSender<KnownMessageType>;
  readonly deploymentContextStore: DeploymentContextStore;
  readonly mergedPRTicketExtractor: MergedPRTicketExtractor;
  readonly qaPlanChecker: QAPlanChecker;
  readonly qaPlanMessageBuilder: QAPlanMessageBuilder;
  readonly jiraHost: string;
}

export class ReleaseReadinessUseCase {
  private readonly unmergedPRsFetcher: UnmergedPRsFetcher;
  private readonly releaseReadinessBuilder: ReleaseReadinessBuilder;
  private readonly messageSender: MessageSender<KnownMessageType>;
  private readonly deploymentContextStore: DeploymentContextStore;
  private readonly mergedPRTicketExtractor: MergedPRTicketExtractor;
  private readonly qaPlanChecker: QAPlanChecker;
  private readonly qaPlanMessageBuilder: QAPlanMessageBuilder;
  private readonly jiraHost: string;

  constructor(dependencies: ReleaseReadinessUseCaseDependencies) {
    this.unmergedPRsFetcher = dependencies.unmergedPRsFetcher;
    this.releaseReadinessBuilder = dependencies.releaseReadinessBuilder;
    this.messageSender = dependencies.messageSender;
    this.deploymentContextStore = dependencies.deploymentContextStore;
    this.mergedPRTicketExtractor = dependencies.mergedPRTicketExtractor;
    this.qaPlanChecker = dependencies.qaPlanChecker;
    this.qaPlanMessageBuilder = dependencies.qaPlanMessageBuilder;
    this.jiraHost = dependencies.jiraHost;
  }

  execute(input: ReleaseReadinessInput): Observable<ReleaseReadinessOutput> {
    return this.unmergedPRsFetcher
      .fetch(input.repository, input.baseBranch)
      .pipe(
        tap(() => this.deploymentContextStore.save(input)),
        flatMap((prs) => {
          if (prs.length > 0) {
            const blocks = this.releaseReadinessBuilder.build(prs);
            return this.messageSender.send({
              destination: input.channel,
              content: blocks
            });
          }

          return from(
            this.mergedPRTicketExtractor
              .extract(input.repository, input.baseBranch)
              .toPromise()
          ).pipe(
            flatMap((ticketIds) =>
              this.qaPlanChecker.check(ticketIds ?? [], input.qaPlanFieldId)
            ),
            flatMap(({ missingQAPlan }) => {
              if (missingQAPlan.length > 0) {
                const blocks = this.qaPlanMessageBuilder.build(
                  missingQAPlan,
                  this.jiraHost
                );
                return this.messageSender.send({
                  destination: input.channel,
                  content: blocks
                });
              }

              return this.messageSender.send({
                destination: input.channel,
                content: this.releaseReadinessBuilder.buildReadyMessage()
              });
            })
          );
        }),
        mapTo({}),
        catchError((error) => throwError(error))
      );
  }
}
