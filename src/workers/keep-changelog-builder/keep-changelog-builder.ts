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
}