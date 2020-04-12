import { Observable, of } from 'rxjs';
import {
  MessageSender,
  MessageSenderInput
} from '../repositories/message-sender';
import {
  ReactionsReader,
  ReactionsReaderInput
} from '../repositories/reactions-reader';
import { NextReleaseGuesser } from '../repositories/next-release-guesser';
import { flatMap, map, delay } from 'rxjs/operators';
import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from './create-release-use-case';

export class StartTrainUseCaseInput {}

export class StartTrainUseCaseOutput {}

export class StartTrainUseCase {
  private nextReleaseGuesser: NextReleaseGuesser;
  private messageSender: MessageSender;
  private reactionsReader: ReactionsReader;
  private createReleaseUseCase: CreateReleaseUseCase;
  private channelToConfirm: string;
  private baseBranch: string;
  private targetBranch: string;
  private pullRequestTitlePrefix: string;

  constructor(
    messageSender: MessageSender,
    reactionsReader: ReactionsReader,
    nextReleaseGuesser: NextReleaseGuesser,
    createReleaseUseCase: CreateReleaseUseCase,
    channelToConfirm: string,
    baseBranch: string,
    targetBranch: string,
    pullRequestTitlePrefix: string,
  ) {
    this.messageSender = messageSender;
    this.reactionsReader = reactionsReader;
    this.nextReleaseGuesser = nextReleaseGuesser;
    this.channelToConfirm = channelToConfirm;
    this.createReleaseUseCase = createReleaseUseCase;
    this.baseBranch = baseBranch
    this.targetBranch = targetBranch
    this.pullRequestTitlePrefix = pullRequestTitlePrefix
  }

  execute(input: StartTrainUseCaseInput): Observable<StartTrainUseCaseOutput> {
    const confirmationReaction = ':100:';
    const confirmationCopyMaker = (version: string) =>
      `Would you like to start the release train for version ${version}? ${confirmationReaction} to continue!`;

    return this.nextReleaseGuesser.guess().pipe(
      flatMap((version) => {
        const copy = confirmationCopyMaker(version);

        return this.messageSender
          .send(new MessageSenderInput(this.channelToConfirm, copy))
          .pipe(delay(10 * 1000))
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
                    version,
                    this.baseBranch,
                    this.targetBranch,
                    `${ this.pullRequestTitlePrefix } ${ version }`
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
