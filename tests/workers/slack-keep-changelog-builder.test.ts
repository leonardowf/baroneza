import { KeepChangelogItem } from '../../src/workers/keep-changelog-builder/keep-changelog-builder';
import { SlackKeepChangelogBuilder } from '../../src/workers/keep-changelog-builder/slack-keep-changelog-builder';

describe('the slack keep changelog builder', () => {
  it('works correctly', () => {
    const sut = new SlackKeepChangelogBuilder();

    const result = sut.build(
      '1.0.0',
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ],
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ],
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ],
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ],
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ],
      [
        new KeepChangelogItem(
          'Text',
          'author',
          'date',
          'identifier',
          'url',
          'authorImageUrl'
        )
      ]
    );

    expect(JSON.stringify(result)).toEqual(
      `[{"type":"header","text":{"type":"plain_text","text":"Changelog - 1.0.0","emoji":true}},{"type":"divider"},{"type":"section","text":{"type":"mrkdwn","text":":sparkles: *Added*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]},{"type":"section","text":{"type":"mrkdwn","text":":recycle: *Changed*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]},{"type":"section","text":{"type":"mrkdwn","text":":wastebasket: *Deprecated*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]},{"type":"section","text":{"type":"mrkdwn","text":":fire: *Removed*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]},{"type":"section","text":{"type":"mrkdwn","text":":bug: *Fixed*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]},{"type":"section","text":{"type":"mrkdwn","text":":lock: *Security*"}},{"type":"context","elements":[{"type":"mrkdwn","text":"- Text"},{"type":"mrkdwn","text":"by: author"},{"type":"mrkdwn","text":"<url|PR #identifier>"},{"type":"image","image_url":"authorImageUrl","alt_text":"author's avatar"}]}]`
    );
  });
});
