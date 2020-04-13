import { Observable, from } from 'rxjs';
import { WebClient } from '@slack/web-api';
import { map } from 'rxjs/operators';

export class MessageSenderInput {
  channel: string;
  text: string;

  constructor(channel: string, text: string) {
    this.channel = channel;
    this.text = text;
  }
}

export class MessageSenderOutput {
  messageIdentifier: string;
  channelIdentifier: string;

  constructor(messageIdentifier: string, channelIdentifier: string) {
    this.messageIdentifier = messageIdentifier;
    this.channelIdentifier = channelIdentifier;
  }
}

export interface MessageSender {
  send(input: MessageSenderInput): Observable<MessageSenderOutput>;
}

export class SlackMessageSender implements MessageSender {
  private webClient: WebClient;

  constructor(webClient: WebClient) {
    this.webClient = webClient;
  }

  send(input: MessageSenderInput): Observable<MessageSenderOutput> {
    return from(
      this.webClient.chat.postMessage({
        channel: input.channel,
        text: input.text
      })
    ).pipe(
      map((x) => {
        return new MessageSenderOutput(x.ts as string, x.channel as string);
      })
    );
  }
}
