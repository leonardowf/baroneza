import { Block, KnownBlock, SectionBlock } from '@slack/web-api';
import { OpenPullRequestSummary } from '../services/github-service';

export class ReleaseReadinessBuilder {
  build(prs: OpenPullRequestSummary[]): Block[] {
    const makeHeader = (text: string): KnownBlock => ({
      type: 'header',
      text: { type: 'plain_text', text, emoji: true }
    });

    const makeSection = (text: string): SectionBlock => ({
      type: 'section',
      text: { type: 'mrkdwn', text }
    });

    const makePRContext = (pr: OpenPullRequestSummary): SectionBlock => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `• <${pr.url}|[PR #${pr.number}] ${pr.title}> — @${pr.author}`
      }
    });

    const blocks: Block[] = [];

    blocks.push(
      makeHeader('🚆 BARONEZA CENTRAL: FINAL CALL FOR THE RELEASE TRAIN')
    );
    blocks.push({ type: 'divider' });
    blocks.push(
      makeSection(
        ':rotating_light: All aboard… or get dramatically left behind. :rotating_light:'
      )
    );
    blocks.push(
      makeSection(
        'The develop express is about to depart the platform, doors closing soon 🚪💨\nIf your PR isn\'t on this train… it will be staring at us from the platform like "wait guys??" 😭'
      )
    );
    blocks.push({ type: 'divider' });

    blocks.push(
      makeSection(':baggage_claim: *Suspicious Luggage (open PRs):*')
    );
    prs.forEach((pr) => blocks.push(makePRContext(pr)));

    blocks.push({ type: 'divider' });
    blocks.push(
      makeSection(
        ':point_right: If *READY*: merge into develop and jump on the train like your life depends on it 🏃💨\n:point_right: If *NOT*: it stays behind… watching us leave… questioning its life choices 🚉'
      )
    );
    blocks.push(
      makeSection(
        ':ticket: I am the conductor. I will whistle. I will judge. I will come back asking questions.'
      )
    );
    blocks.push(
      makeSection("Let's not have any PRs chasing the train in slow motion 😄")
    );
    blocks.push({ type: 'divider' });
    blocks.push(
      makeSection('🚦 When all PRs are sorted, say *Proceed* to depart.')
    );

    return blocks;
  }

  buildReadyMessage(): Block[] {
    const makeHeader = (text: string): any => ({
      type: 'header',
      text: { type: 'plain_text', text, emoji: true }
    });

    const makeSection = (text: string): SectionBlock => ({
      type: 'section',
      text: { type: 'mrkdwn', text }
    });

    return [
      makeHeader('🚆 BARONEZA CENTRAL: GREEN SIGNAL FOR DEPARTURE'),
      { type: 'divider' },
      makeSection(
        '🚦All tracks are clear. No PRs left behind. QA has blessed this journey 🙏'
      ),
      makeSection(
        'The train is fueled, doors are closed, and the driver is *already reaching for the horn* 🚂📯'
      ),
      { type: 'divider' },
      makeSection(
        '👉 Say the magic words: *"Proceed"* — and the *release PR will be created* 🧾✨'
      ),
      makeSection(
        '_Next stop: production. No delays, no drama, no passengers sprinting on the platform._ 😄'
      )
    ];
  }
}
