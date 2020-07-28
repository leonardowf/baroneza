export interface KeepChangelogBuilder {
  build(
    version: string,
    added: KeepChangelogItem[],
    changed: KeepChangelogItem[],
    deprecated: KeepChangelogItem[],
    removed: KeepChangelogItem[],
    fixed: KeepChangelogItem[],
    security: KeepChangelogItem[]
  ): string | undefined;
}

export class KeepChangelogItem {
  text: string;
  author: string;
  date: string;
  identifier: string;

  constructor(text: string, author: string, date: string, identifier: string) {
    this.text = text;
    this.author = author;
    this.date = date;
    this.identifier = identifier;
  }

  toString(): string {
    let item = `${this.text}, by ${this.author} - (#${this.identifier})`;
    if (!this.text.trim().includes('- ')) {
      item = `- ${item}`;
    }
    return item;
  }
}

export class ConcreteKeepChangelogBuilder implements KeepChangelogBuilder {
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
    if (numberOfEntries == 0) {
      return undefined;
    }

    lines.push(`## ${version}`);

    if (added.length > 0) {
      lines.push(`### Added`);
      lines = lines.concat(added.map((x) => x.toString()));
      lines.push(``);
    }

    if (changed.length > 0) {
      lines.push(`### Changed`);
      lines = lines.concat(changed.map((x) => x.toString()));
      lines.push(``);
    }

    if (deprecated.length > 0) {
      lines.push(`### Deprecated`);
      lines = lines.concat(deprecated.map((x) => x.toString()));
      lines.push(``);
    }

    if (removed.length > 0) {
      lines.push(`### Removed`);
      lines = lines.concat(removed.map((x) => x.toString()));
      lines.push(``);
    }

    if (fixed.length > 0) {
      lines.push(`### Fixed`);
      lines = lines.concat(fixed.map((x) => x.toString()));
      lines.push(``);
    }

    if (security.length > 0) {
      lines.push(`### Security`);
      lines = lines.concat(security.map((x) => x.toString()));
      lines.push(``);
    }

    return lines.join('\n').trim();
  }
}
