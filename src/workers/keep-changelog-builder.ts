export interface KeepChangelogBuilder {
  build(
    version: string,
    added: KeepChangelogItem[],
    changed: KeepChangelogItem[],
    deprecated: KeepChangelogItem[],
    removed: KeepChangelogItem[],
    fixed: KeepChangelogItem[],
    security: KeepChangelogItem[]
  ): string;
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
    return `${this.text}, by ${this.author}, ${this.date}, (#${this.identifier})`;
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
  ): string {
    let lines: string[] = [];

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
