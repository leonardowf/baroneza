import { KnownBlock } from '@slack/web-api';

export type SlackBlock = KnownBlock;

export type SlackCommandContext = {
  readonly channel: string;
  readonly threadToReply: string;
  readonly text: string;
  replyInThread(text: string): Promise<void>;
  replyWithBlocks(blocks: SlackBlock[], fallbackText: string): Promise<void>;
};

export interface SlackCommand {
  matches(text: string): boolean;
  execute(context: SlackCommandContext): Promise<void>;
}
