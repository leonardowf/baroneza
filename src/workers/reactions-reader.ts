import { Observable, from } from 'rxjs';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import { map } from 'rxjs/operators';

export class ReactionsReaderInput {
  channel: string;
  messageIdentifier: string;

  constructor(channel: string, messageIdentifier: string) {
    this.channel = channel;
    this.messageIdentifier = messageIdentifier;
  }
}

export class ReactionsReaderOutput {
  reactions: Reaction[];

  constructor(reactions: Reaction[]) {
    this.reactions = reactions || [];
  }
}

export interface Reaction {
  readonly count: number;
  readonly name: string;
}

export interface ReactionsReader {
  read(input: ReactionsReaderInput): Observable<ReactionsReaderOutput>;
}

export class SlackReactionsReader implements ReactionsReader {
  private webClient: WebClient;

  constructor(webClient: WebClient) {
    this.webClient = webClient;
  }

  read(input: ReactionsReaderInput): Observable<ReactionsReaderOutput> {
    return from(
      this.webClient.reactions.get({
        timestamp: input.messageIdentifier,
        channel: input.channel
      })
    ).pipe(
      map((x) => {
        return new ReactionsReaderOutput(
          (x as SlackReactionsResponseMapper).message.reactions
        );
      })
    );
  }
}

interface SlackReactionsResponseMapper extends WebAPICallResult {
  message: {
    reactions: [Reaction];
  };
}
