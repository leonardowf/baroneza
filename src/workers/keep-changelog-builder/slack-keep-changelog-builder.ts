import { Block, ContextBlock, KnownBlock, MrkdwnElement } from "@slack/web-api";
import { KeepChangelogBuilder, KeepChangelogItem } from "./keep-changelog-builder";

export class SlackKeepChangelogBuilder implements KeepChangelogBuilder<Block[]> {
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

    let blocks: (KnownBlock | Block)[] = []

    const makeHeader = (text: string): any => ({
      type: "header",
      text: {
        type: "plain_text",
        text: `${text}`,
        emoji: true
      }
    })

    const makeMarkdown = (text: string): MrkdwnElement => ({
      type: "mrkdwn",
      text: text
    })


    const makeContext = (item: KeepChangelogItem): Block => {
      const context: ContextBlock = {
        type: "context",
        elements: [
          makeMarkdown(`${item.text}`),
          makeMarkdown(`${item.author}`),
          makeMarkdown(`${item.identifier}`)
        ]
      }
      return context
    }

    blocks.push(makeHeader(version))
    blocks.push({type: "divider"})

    if (added.length > 0) {
      blocks.push(makeHeader(":sparkles: Added"))
      added.map(makeContext).forEach((value) => blocks.push(value))
    }

    if (changed.length > 0) {
      blocks.push(makeHeader(":recycle: Changed"))
      changed.map(makeContext).forEach((value) => blocks.push(value))
    }

    if (deprecated.length > 0) {
      blocks.push(makeHeader(":sparkles: Deprecated"))
      deprecated.map(makeContext).forEach((value) => blocks.push(value))
    }

    if (removed.length > 0) {
      blocks.push(makeHeader(":fire: Removed"))
      removed.map(makeContext).forEach((value) => blocks.push(value))
    }

    if (fixed.length > 0) {
      blocks.push(makeHeader(":bug: Fixed"))
      fixed.map(makeContext).forEach((value) => blocks.push(value))
    }

    if (security.length > 0) {
      blocks.push(makeHeader(":lock: Security"))
      security.map(makeContext).forEach((value) => blocks.push(value))
    }

    return blocks
  }
}

