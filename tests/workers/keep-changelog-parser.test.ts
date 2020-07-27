import { ConcreteKeepChangelogParser } from '../../src/workers/keep-changelog-parser';

describe('the keep changelog parser', () => {
  let sut: ConcreteKeepChangelogParser;

  beforeEach(() => {
    sut = new ConcreteKeepChangelogParser();
  });

  it('with no changelog section, no output', () => {
    expect(sut.parse('blablabla')).toBeNull();
  });

  it('with changelog section, has output', () => {
    const text = `
        ## Changelog

        ### Added
        - Support to multi platform

        - Support to Jira version creation
        ### Changed
        - Feature flag name
        ### Deprecated
        ### Removed
        ### Fixed
        ### Security
        ---
        `;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    expect(sut.parse(text)!.added[0]).toEqual('- Support to multi platform');
    expect(sut.parse(text)!.added[1]).toEqual(
      '- Support to Jira version creation'
    );

    expect(sut.parse(text)!.changed[0]).toEqual('- Feature flag name');

    expect(sut.parse(text)!.deprecated[0]).toBeUndefined();
    expect(sut.parse(text)!.removed[0]).toBeUndefined();
    expect(sut.parse(text)!.fixed[0]).toBeUndefined();
    expect(sut.parse(text)!.security[0]).toBeUndefined();
  });

  it('with changelog section, many lines, many characthers', () => {
    const text = `
        ## Changelog

        ### Added
        - Support to multi platform
        
        - Support to Jira version creation
        ### Changed
        - Feature flag name
        ### Deprecated
        a
        ### Removed
        b
        ### Fixed
        c
        🤦‍♂️
        ### Security
        The word 'jaguar' comes from the indigenous word 'yaguar', which means 'he who kills with one leap'.
        Jaguars used to be found from south-west USA, throughout South America to almost the far north in Argentina. Now, they’ve been virtually eliminated from half of their historic range.  
        
        Males can weigh 120kg (that’s almost 19 stone), but the size of jaguars can vary a lot between regions - jaguars in central America can be roughly half the size of jaguars in the Pantanal. They need that bulk behind them to take on big prey, including giant caiman.

        ---
        `;
    expect(sut.parse(text)!.added[0]).toEqual('- Support to multi platform');
    expect(sut.parse(text)!.added[1]).toEqual(
      '- Support to Jira version creation'
    );
    expect(sut.parse(text)!.changed[0]).toEqual('- Feature flag name');

    expect(sut.parse(text)!.deprecated[0]).toEqual('a');
    expect(sut.parse(text)!.removed[0]).toEqual('b');
    expect(sut.parse(text)!.fixed[0]).toEqual('c');
    expect(sut.parse(text)!.fixed[1]).toEqual('🤦‍♂️');
    expect(sut.parse(text)!.security[0]).toEqual(
      "The word 'jaguar' comes from the indigenous word 'yaguar', which means 'he who kills with one leap'."
    );

    expect(sut.parse(text)!.security[1]).toEqual(
      'Jaguars used to be found from south-west USA, throughout South America to almost the far north in Argentina. Now, they’ve been virtually eliminated from half of their historic range.'
    );
    expect(sut.parse(text)!.security[2]).toEqual(
      'Males can weigh 120kg (that’s almost 19 stone), but the size of jaguars can vary a lot between regions - jaguars in central America can be roughly half the size of jaguars in the Pantanal. They need that bulk behind them to take on big prey, including giant caiman.'
    );
  });
});

/* eslint-disable @typescript-eslint/no-non-null-assertion */
