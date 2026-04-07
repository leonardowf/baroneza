import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import {
  SlackCommand,
  SlackBlock,
  SlackCommandContext
} from '../commands/slack-command';

export type MentionListenerDependencies = {
  slackAppToken: string;
  webClient: WebClient;
  commands: SlackCommand[];
};

export class MentionListener {
  private readonly socketClient: SocketModeClient;
  private readonly webClient: WebClient;
  private readonly commands: SlackCommand[];

  constructor(dependencies: MentionListenerDependencies) {
    this.socketClient = new SocketModeClient({
      appToken: dependencies.slackAppToken
    });
    this.webClient = dependencies.webClient;
    this.commands = dependencies.commands;
  }

  async start(): Promise<void> {
    this.socketClient.on('app_mention', async ({ event, ack }) => {
      await ack();
      await this.handleMention(event);
    });

    await this.socketClient.start();
  }

  private async handleMention(event: {
    text: string;
    channel: string;
    ts: string;
  }): Promise<void> {
    const command = this.commands.find((c) => c.matches(event.text));
    if (!command) return;

    const channel = event.channel;
    const threadToReply = event.ts;
    const context: SlackCommandContext = {
      channel,
      threadToReply,
      text: event.text,
      replyInThread: (text: string) =>
        this.replyInThread(channel, threadToReply, text),
      replyWithBlocks: (blocks: SlackBlock[], fallbackText: string) =>
        this.replyWithBlocks(channel, threadToReply, blocks, fallbackText)
    };

    try {
      await command.execute(context);
    } catch (error) {
      await this.replyInThread(
        channel,
        threadToReply,
        `:warning: Baroneza failed: ${
          (error as Error).message ?? 'Unknown error'
        }`
      );
    }
  }

  private async replyInThread(
    channel: string,
    threadToReply: string,
    text: string
  ): Promise<void> {
    await this.webClient.chat.postMessage({
      channel,
      // eslint-disable-next-line @typescript-eslint/camelcase
      thread_ts: threadToReply,
      text
    });
  }

  private async replyWithBlocks(
    channel: string,
    threadToReply: string,
    blocks: SlackBlock[],
    text: string
  ): Promise<void> {
    await this.webClient.chat.postMessage({
      channel,
      // eslint-disable-next-line @typescript-eslint/camelcase
      thread_ts: threadToReply,
      blocks,
      text
    });
  }
}
