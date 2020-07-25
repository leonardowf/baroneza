import { Observable, of } from 'rxjs';
import { MessageSender, MessageSenderInput } from '../workers/message-sender';
import {
  ReactionsReader,
  ReactionsReaderInput
} from '../workers/reactions-reader';
import { NextReleaseGuesser } from '../workers/next-release-guesser';
import { flatMap, map, delay } from 'rxjs/operators';
import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from './create-release-use-case';

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
  private readonly messageSender: MessageSender;
  private readonly reactionsReader: ReactionsReader;
  private readonly createReleaseUseCase: CreateReleaseUseCase;
  private readonly branchPrefix: string;
  private readonly baseBranch: string;
  private readonly targetBranch: string;
  private readonly pullRequestTitlePrefix: string;
  private readonly secondsToConfirmationTimeout: number;
  private readonly project: string;

  constructor(
    messageSender: MessageSender,
    reactionsReader: ReactionsReader,
    nextReleaseGuesser: NextReleaseGuesser,
    createReleaseUseCase: CreateReleaseUseCase,
    branchPrefix: string,
    baseBranch: string,
    targetBranch: string,
    pullRequestTitlePrefix: string,
    secondsToConfirmationTimeout: number,
    project: string
  ) {
    this.messageSender = messageSender;
    this.reactionsReader = reactionsReader;
    this.nextReleaseGuesser = nextReleaseGuesser;
    this.createReleaseUseCase = createReleaseUseCase;
    this.branchPrefix = branchPrefix;
    this.baseBranch = baseBranch;
    this.targetBranch = targetBranch;
    this.pullRequestTitlePrefix = pullRequestTitlePrefix;
    this.secondsToConfirmationTimeout = secondsToConfirmationTimeout;
    this.project = project;
  }

  execute(input: StartTrainUseCaseInput): Observable<StartTrainUseCaseOutput> {
    const confirmationReaction = ':100:';
    const confirmationCopyMaker = (version: string): string =>
      `Would you like to start the release train for version ${version}? ${confirmationReaction} to continue!`;

    return this.nextReleaseGuesser.guess(input.repository).pipe(
      flatMap((version) => {
        const copy = confirmationCopyMaker(version);

        return this.messageSender
          .send(new MessageSenderInput(input.channel, copy))
          .pipe(delay(this.secondsToConfirmationTimeout * 1000))
          .pipe(
            flatMap((x) =>
              this.reactionsReader.read(
                new ReactionsReaderInput(
                  x.channelIdentifier,
                  x.messageIdentifier
                )
              )
            )
          )
          .pipe(
            map((x) =>
              x.reactions.filter(
                (y) => y.name === confirmationReaction.split(':').join('')
              )
            )
          )
          .pipe(map((x) => x.length > 0))
          .pipe(
            flatMap((confirmed) => {
              if (confirmed) {
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
