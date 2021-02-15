import {
  MessageSender,
  MessageSenderInput,
  MessageSenderOutput
} from '../../src/workers/message-sender';
import {
  ReactionsReader,
  ReactionsReaderInput,
  ReactionsReaderOutput,
  Reaction
} from '../../src/workers/reactions-reader';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import {
  SlackAskConfirmationUseCase,
  AskConfirmationUseCaseInput,
  AskConfirmationUseCaseOutput
} from '../../src/use-cases/ask-confirmation-use-case';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';

class TestReaction implements Reaction {
  readonly count: number;
  readonly name: string;

  constructor(count: number, name: string) {
    this.count = count;
    this.name = name;
  }
}

describe('The ask confirmation use case', () => {
  let scheduler: TestScheduler;

  beforeEach(
    () =>
      (scheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      }))
  );

  it('waits the timeout and does not confirm with empty array', () => {
    const messageSenderMock = mock<MessageSender<string>>();
    const reactionsReaderMock = mock<ReactionsReader>();
    const confirmationReaction = ':100:';
    const secondsTimeout = 7;

    scheduler.run((helpers) => {
      const messageSenderInput: MessageSenderInput<string> = { destination: "channel", content: "question" };
      const messageSenderOutput = new MessageSenderOutput(
        'messageIdentifier',
        'channelIdentifier'
      );
      const messageSenderStream = of(messageSenderOutput);
      when(messageSenderMock.send(deepEqual(messageSenderInput))).thenReturn(
        messageSenderStream
      );

      const messageSender = instance(messageSenderMock);

      const reactionsReaderInput = new ReactionsReaderInput(
        'channelIdentifier',
        'messageIdentifier'
      );
      const reactionsReaderOutput = new ReactionsReaderOutput([]);
      const reactionsReaderStream = of(reactionsReaderOutput);
      when(
        reactionsReaderMock.read(deepEqual(reactionsReaderInput))
      ).thenReturn(reactionsReaderStream);

      const reactionsReader = instance(reactionsReaderMock);

      const sut = new SlackAskConfirmationUseCase(
        messageSender,
        reactionsReader,
        confirmationReaction,
        secondsTimeout
      );
      const mapping = { a: new AskConfirmationUseCaseOutput(false) };
      const marbles = '7000ms (a|)';
      helpers
        .expectObservable(
          sut.execute(new AskConfirmationUseCaseInput('question', 'channel'))
        )
        .toBe(marbles, mapping);
    });
  });

  it('waits the timeout and confirm with the correct reaction', () => {
    const messageSenderMock = mock<MessageSender<string>>();
    const reactionsReaderMock = mock<ReactionsReader>();
    const confirmationReaction = ':100:';
    const secondsTimeout = 7;

    scheduler.run((helpers) => {
      const messageSenderInput: MessageSenderInput<string> = { destination: "channel", content: "question" };
      const messageSenderOutput = new MessageSenderOutput(
        'messageIdentifier',
        'channelIdentifier'
      );
      const messageSenderStream = of(messageSenderOutput);
      when(messageSenderMock.send(deepEqual(messageSenderInput))).thenReturn(
        messageSenderStream
      );

      const messageSender = instance(messageSenderMock);

      const reactionsReaderInput = new ReactionsReaderInput(
        'channelIdentifier',
        'messageIdentifier'
      );
      const reactionsReaderOutput = new ReactionsReaderOutput([
        new TestReaction(1, '100')
      ]);
      const reactionsReaderStream = of(reactionsReaderOutput);
      when(
        reactionsReaderMock.read(deepEqual(reactionsReaderInput))
      ).thenReturn(reactionsReaderStream);

      const reactionsReader = instance(reactionsReaderMock);

      const sut = new SlackAskConfirmationUseCase(
        messageSender,
        reactionsReader,
        confirmationReaction,
        secondsTimeout
      );
      const mapping = { a: new AskConfirmationUseCaseOutput(true) };
      const marbles = '7000ms (a|)';
      helpers
        .expectObservable(
          sut.execute(new AskConfirmationUseCaseInput('question', 'channel'))
        )
        .toBe(marbles, mapping);
    });
  });
});
