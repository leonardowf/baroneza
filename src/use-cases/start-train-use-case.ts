import { Observable, of } from 'rxjs';
import {
  NextReleaseGuesser,
  ReleaseType
} from '../workers/next-release-guesser';
import { flatMap } from 'rxjs/operators';
import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from './create-release-use-case';
import {
  AskConfirmationUseCase,
  AskConfirmationUseCaseInput
} from './ask-confirmation-use-case';

export class StartTrainUseCaseInput {
  readonly repository: string;
  readonly baseBranch: string;
  readonly targetBranch: string;
  readonly channel: string;
  readonly jiraTagSuffix: string;
  readonly releaseType: ReleaseType;

  constructor(
    repository: string,
    baseBranch: string,
    targetBranch: string,
    channel: string,
    jiraTagSuffix: string,
    releaseType: ReleaseType
  ) {
    this.repository = repository;
    this.baseBranch = baseBranch;
    this.targetBranch = targetBranch;
    this.channel = channel;
    this.jiraTagSuffix = jiraTagSuffix;
    this.releaseType = releaseType;
  }
}

export class StartTrainUseCaseOutput {}

export class StartTrainUseCase {
  private readonly nextReleaseGuesser: NextReleaseGuesser;
  private readonly createReleaseUseCase: CreateReleaseUseCase;
  private readonly askConfirmationUseCase: AskConfirmationUseCase;
  private readonly branchPrefix: string;
  private readonly baseBranch: string;
  private readonly targetBranch: string;
  private readonly pullRequestTitlePrefix: string;
  private readonly project: string;
  private readonly confirmationReaction: string;
  private readonly secondsToConfirmationTimeout: number;

  constructor(
    nextReleaseGuesser: NextReleaseGuesser,
    createReleaseUseCase: CreateReleaseUseCase,
    askConfirmationUseCase: AskConfirmationUseCase,
    branchPrefix: string,
    baseBranch: string,
    targetBranch: string,
    pullRequestTitlePrefix: string,
    project: string,
    confirmationReaction: string,
    secondsToConfirmationTimeout: number
  ) {
    this.nextReleaseGuesser = nextReleaseGuesser;
    this.createReleaseUseCase = createReleaseUseCase;
    this.askConfirmationUseCase = askConfirmationUseCase;

    this.branchPrefix = branchPrefix;
    this.baseBranch = baseBranch;
    this.targetBranch = targetBranch;
    this.pullRequestTitlePrefix = pullRequestTitlePrefix;
    this.project = project;
    this.confirmationReaction = confirmationReaction;
    this.secondsToConfirmationTimeout = secondsToConfirmationTimeout;
  }

  execute(input: StartTrainUseCaseInput): Observable<StartTrainUseCaseOutput> {
    const confirmationCopyMaker = (version: string): string => {
      return (
        `🚂 \n` +
        'Chugga chugga chugga chugga chugga choo choooooo!\n' + // TODO: agree on how many chuggas before a choo choo
        `---\n` +
        `The train for version ${version} will depart in ${this.secondsToConfirmationTimeout} seconds\n` +
        `---\n` +
        'Be sure that everything is merged and the branches are properly aligned\n' +
        `---\n` +
        `React to this message with ${this.confirmationReaction} to stop the train`
      );
    };

    return this.nextReleaseGuesser
      .guess(input.repository, input.releaseType)
      .pipe(
        flatMap((version) => {
          const copy = confirmationCopyMaker(version);
          return this.askConfirmationUseCase
            .execute(new AskConfirmationUseCaseInput(copy, input.channel))
            .pipe(
              flatMap((confirmationRequest) => {
                if (!confirmationRequest.reacted) {
                  return this.createReleaseUseCase.execute(
                    new CreateReleaseUseCaseInput(
                      `${this.branchPrefix}${version}`,
                      this.baseBranch,
                      this.targetBranch,
                      `${this.pullRequestTitlePrefix} ${version}`,
                      version,
                      this.project,
                      input.repository,
                      input.channel,
                      input.jiraTagSuffix
                    )
                  );
                } else {
                  return of(new StartTrainUseCaseOutput());
                }
              })
            );
        })
      );
  }
}
