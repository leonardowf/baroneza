import { Observable, of } from 'rxjs';
import { NextReleaseGuesser } from '../workers/next-release-guesser';
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

  constructor(
    repository: string,
    baseBranch: string,
    targetBranch: string,
    channel: string
  ) {
    this.repository = repository;
    this.baseBranch = baseBranch;
    this.targetBranch = targetBranch;
    this.channel = channel;
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

  constructor(
    nextReleaseGuesser: NextReleaseGuesser,
    createReleaseUseCase: CreateReleaseUseCase,
    askConfirmationUseCase: AskConfirmationUseCase,
    branchPrefix: string,
    baseBranch: string,
    targetBranch: string,
    pullRequestTitlePrefix: string,
    project: string,
    confirmationReaction: string
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
  }

  execute(input: StartTrainUseCaseInput): Observable<StartTrainUseCaseOutput> {
    const confirmationCopyMaker = (version: string): string =>
      `Would you like to start the release train for version ${version}? ${this.confirmationReaction} to continue!`;

    return this.nextReleaseGuesser.guess(input.repository).pipe(
      flatMap((version) => {
        const copy = confirmationCopyMaker(version);
        return this.askConfirmationUseCase
          .execute(new AskConfirmationUseCaseInput(copy, input.channel))
          .pipe(
            flatMap((confirmationRequest) => {
              if (confirmationRequest.confirmed) {
                return this.createReleaseUseCase.execute(
                  new CreateReleaseUseCaseInput(
                    `${this.branchPrefix}${version}`,
                    this.baseBranch,
                    this.targetBranch,
                    `${this.pullRequestTitlePrefix} ${version}`,
                    version,
                    this.project,
                    input.repository
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
