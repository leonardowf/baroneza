import { Observable } from 'rxjs';
import { KnownMessageType, MessageSender, MessageSenderInput } from '../workers/message-sender';
import {
  ReactionsReaderInput,
  ReactionsReader
} from '../workers/reactions-reader';
import { flatMap, map, delay } from 'rxjs/operators';

export interface AskConfirmationUseCase {
  execute(
    input: AskConfirmationUseCaseInput
  ): Observable<AskConfirmationUseCaseOutput>;
}

export class AskConfirmationUseCaseInput {
  question: string;
  channel: string;

  constructor(question: string, channel: string) {
    this.question = question;
    this.channel = channel;
  }
}

export class AskConfirmationUseCaseOutput {
  readonly confirmed: boolean;

  constructor(confirmed: boolean) {
    this.confirmed = confirmed;
  }
}

export class SlackAskConfirmationUseCase {
  readonly messageSender: MessageSender<KnownMessageType>;
  readonly reactionsReader: ReactionsReader;
  readonly confirmationReaction: string;
  readonly secondsTimeout: number;

  constructor(
    messageSender: MessageSender<KnownMessageType>,
    reactionsReader: ReactionsReader,
    confirmationReaction: string,
    secondsTimeout: number
  ) {
    this.messageSender = messageSender;
    this.reactionsReader = reactionsReader;
    this.confirmationReaction = confirmationReaction;
    this.secondsTimeout = secondsTimeout;
  }

  execute(
    input: AskConfirmationUseCaseInput
  ): Observable<AskConfirmationUseCaseOutput> {
    return this.messageSender
      .send({destination: input.channel, content: input.question })
      .pipe(delay(this.secondsTimeout * 1000))
      .pipe(
        flatMap((x) =>
          this.reactionsReader.read(
            new ReactionsReaderInput(x.channelIdentifier, x.messageIdentifier)
          )
        )
      )
      .pipe(
        map((x) =>
          x.reactions.filter(
            (y) => y.name === this.confirmationReaction.split(':').join('')
          )
        )
      )
      .pipe(map((x) => x.length > 0))
      .pipe(
        map((confirmed) => {
          return new AskConfirmationUseCaseOutput(confirmed);
        })
      );
  }
}
