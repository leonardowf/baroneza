import { ConcreteJiraTickerParser } from '../../src/workers/jira-ticket-parser';

describe('The jira ticket parser', () => {
  let sut: ConcreteJiraTickerParser;
  beforeEach(() => {
    sut = new ConcreteJiraTickerParser();
  });

  it('works with number tags', () => {
    const commit = '[PSF-123]PSF-456 [PSF-78910] Bla Bla';

    expect(sut.parse([commit]).parsedTickets).toStrictEqual([
      {
        value: commit,
        ticket: 'PSF-123'
      },
      {
        value: commit,
        ticket: 'PSF-456'
      },
      {
        value: commit,
        ticket: 'PSF-78910'
      }
    ]);
  });

  it('does not work with letter tags', () => {
    const commit = '[PSF-abc][PSF-def] [PSF-ghi] Bla Bla';

    expect(sut.parse([commit]).parsedTickets).toStrictEqual([]);
  });

  it('does not duplicate tickets in same commit', () => {
    const commit = '[PSF-123][PSF-123] [PSF-78910] Bla Bla';

    expect(sut.parse([commit]).parsedTickets).toStrictEqual([
      {
        value: commit,
        ticket: 'PSF-123'
      },
      {
        value: commit,
        ticket: 'PSF-78910'
      }
    ]);
  });

  it('duplicate tickets in different commits', () => {
    const commit1 = '[PSF-123][PSF-123] [PSF-78910] Bla Bla';
    const commit2 = '[PSF-123][PSF-123] [PSF-78910] Bla Bla Bla';

    expect(sut.parse([commit1, commit2]).parsedTickets).toStrictEqual([
      {
        value: commit1,
        ticket: 'PSF-123'
      },
      {
        value: commit1,
        ticket: 'PSF-78910'
      },
      {
        value: commit2,
        ticket: 'PSF-123'
      },
      {
        value: commit2,
        ticket: 'PSF-78910'
      }
    ]);
  });
});
