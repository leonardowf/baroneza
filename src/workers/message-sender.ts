import { Observable, from } from 'rxjs';
import { Block, WebClient } from '@slack/web-api';
import { map } from 'rxjs/operators';

export interface MessageSenderInput<T> {
  destination: string;
  content: T;
}

export class MessageSenderOutput {
  messageIdentifier: string;
  channelIdentifier: string;

  constructor(messageIdentifier: string, channelIdentifier: string) {
    this.messageIdentifier = messageIdentifier;
    this.channelIdentifier = channelIdentifier;
  }
}

export interface MessageSender<T> {
  send(message: MessageSenderInput<T>): Observable<MessageSenderOutput>;
}

export type KnownMessageType = string | Block[];

export class SlackMessageSender implements MessageSender<KnownMessageType> {
  private webClient: WebClient;

  constructor(webClient: WebClient) {
    this.webClient = webClient;
  }

  send(
    message: MessageSenderInput<KnownMessageType>
  ): Observable<MessageSenderOutput> {
    switch (typeof message.content) {
      case 'string':
        return from(
          this.webClient.chat.postMessage({
            channel: message.destination,
            text: message.content
          })
        ).pipe(
          map((response) => {
            return new MessageSenderOutput(
              response.ts as string,
              response.channel as string
            );
          })
        );
      default:
        return from(
          this.webClient.chat.postMessage({
            blocks: message.content,
            channel: message.destination,
            text: 'blocks'
          })
        ).pipe(
          map((response) => {
            return new MessageSenderOutput(
              response.ts as string,
              response.channel as string
            );
          })
        );
    }
  }
}
