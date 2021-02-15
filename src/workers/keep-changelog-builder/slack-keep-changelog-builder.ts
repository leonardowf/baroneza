/* eslint-disable @typescript-eslint/camelcase */
import {
  Block,
  ContextBlock,
  ImageBlock,
  ImageElement,
  KnownBlock,
  MrkdwnElement,
  PlainTextElement,
  SectionBlock
} from '@slack/web-api';
import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from './keep-changelog-builder';

export class SlackKeepChangelogBuilder
  implements KeepChangelogBuilder<Block[]> {
  build(
    version: string,
    added: KeepChangelogItem[],
    changed: KeepChangelogItem[],
    deprecated: KeepChangelogItem[],
    removed: KeepChangelogItem[],
    fixed: KeepChangelogItem[],
    security: KeepChangelogItem[]
  ): Block[] | undefined {
    const numberOfEntries =
      added.length +
      changed.length +
      deprecated.length +
      removed.length +
      fixed.length +
      security.length;
    if (numberOfEntries === 0) {
      return undefined;
    }

    const blocks: (KnownBlock | Block)[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeHeader = (text: string): any => ({
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${text}`,
        emoji: true
      }
    });

    const makeMarkdown = (text: string): MrkdwnElement => ({
      type: 'mrkdwn',
      text: text
    });

    const makeSection = (text: string): SectionBlock => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: text
      }
    });

    const makeImage = (url: string): ImageBlock => ({
      type: 'image',
      image_url: url,
      alt_text: "author's avatar"
    });

    const makeContext = (item: KeepChangelogItem): Block => {
      const elements: (MrkdwnElement | PlainTextElement | ImageElement)[] = [
        makeMarkdown(`- ${item.text.trim().replace('- ', '')}`),
        makeMarkdown(`by: ${item.author}`),
        makeMarkdown(`<${item.url}|PR #${item.identifier}>`)
      ];

      if (item.authorImageUrl) {
        elements.push(makeImage(item.authorImageUrl));
      }

      const context: ContextBlock = {
        type: 'context',
        elements: elements
      };
      return context;
    };

    blocks.push(makeHeader(`Changelog - ${version}`));
    blocks.push({ type: 'divider' });

    if (added.length > 0) {
      blocks.push(makeSection(':sparkles: *Added*'));
      added.map(makeContext).forEach((value) => blocks.push(value));
    }

    if (changed.length > 0) {
      blocks.push(makeSection(':recycle: *Changed*'));
      changed.map(makeContext).forEach((value) => blocks.push(value));
    }

    if (deprecated.length > 0) {
      blocks.push(makeSection(':wastebasket: *Deprecated*'));
      deprecated.map(makeContext).forEach((value) => blocks.push(value));
    }

    if (removed.length > 0) {
      blocks.push(makeSection(':fire: *Removed*'));
      removed.map(makeContext).forEach((value) => blocks.push(value));
    }

    if (fixed.length > 0) {
      blocks.push(makeSection(':bug: *Fixed*'));
      fixed.map(makeContext).forEach((value) => blocks.push(value));
    }

    if (security.length > 0) {
      blocks.push(makeSection(':lock: *Security*'));
      security.map(makeContext).forEach((value) => blocks.push(value));
    }

    return blocks;
  }
}
