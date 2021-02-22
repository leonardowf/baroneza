import { ConcreteJiraTickerParser } from '../../src/workers/jira-ticket-parser';

describe('The jira ticket parser', () => {
  let sut: ConcreteJiraTickerParser;
  beforeEach(() => {
    sut = new ConcreteJiraTickerParser();
  });

  it('works with number tags', () => {
    expect(sut.parse(['[PSF-123][PSF-456] [PSF-78910] Bla Bla'])).toStrictEqual(['PSF-123', 'PSF-456', 'PSF-78910']);
  });

  it('does not work with number tags', () => {
    expect(sut.parse(['[PSF-abc] Bla Bla'])).toStrictEqual([]);
  });

  it('does not duplicate tickets', () => {
    expect(sut.parse(['[PSF-13][PSF-13] Bla Bla'])).toStrictEqual(['PSF-13']);
  });

  it('works without brackets', () => {
    expect(sut.parse(['PSF-123 PSF-123 Bla Bla'])).toStrictEqual(['PSF-123']);
  });
});
