import {
  KeepChangelogBuilder,
  KeepChangelogItem
} from './keep-changelog-builder';

export class MarkdownKeepChangelogBuilder
  implements KeepChangelogBuilder<string> {
  build(
    version: string,
    added: KeepChangelogItem[],
    changed: KeepChangelogItem[],
    deprecated: KeepChangelogItem[],
    removed: KeepChangelogItem[],
    fixed: KeepChangelogItem[],
    security: KeepChangelogItem[]
  ): string | undefined {
    let lines: string[] = [];

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

    lines.push(`## ${version}`);

    if (added.length > 0) {
      lines.push(`### Added`);
      lines = lines.concat(added.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    if (changed.length > 0) {
      lines.push(`### Changed`);
      lines = lines.concat(changed.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    if (deprecated.length > 0) {
      lines.push(`### Deprecated`);
      lines = lines.concat(deprecated.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    if (removed.length > 0) {
      lines.push(`### Removed`);
      lines = lines.concat(removed.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    if (fixed.length > 0) {
      lines.push(`### Fixed`);
      lines = lines.concat(fixed.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    if (security.length > 0) {
      lines.push(`### Security`);
      lines = lines.concat(security.map((x) => this.itemToMarkdownString(x)));
      lines.push(``);
    }

    return lines.join('\n').trim();
  }

  private itemToMarkdownString(item: KeepChangelogItem): string {
    let result = `${item.text}, by @${item.author} - (#${item.identifier})`;
    if (!item.text.trim().includes('- ')) {
      result = `- ${result}`;
    }
    return result;
  }
}
