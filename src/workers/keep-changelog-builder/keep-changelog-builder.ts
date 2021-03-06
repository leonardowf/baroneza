export interface KeepChangelogBuilder<T> {
  build(
    version: string,
    added: KeepChangelogItem[],
    changed: KeepChangelogItem[],
    deprecated: KeepChangelogItem[],
    removed: KeepChangelogItem[],
    fixed: KeepChangelogItem[],
    security: KeepChangelogItem[]
  ): T | undefined;
}

export class KeepChangelogItem {
  text: string;
  author: string;
  date: string;
  identifier: string;
  url: string;
  authorImageUrl: string | undefined;

  constructor(
    text: string,
    author: string,
    date: string,
    identifier: string,
    url: string,
    authorImageUrl: string | undefined = undefined
  ) {
    this.text = text;
    this.author = author;
    this.date = date;
    this.identifier = identifier;
    this.url = url;
    this.authorImageUrl = authorImageUrl;
  }
}
