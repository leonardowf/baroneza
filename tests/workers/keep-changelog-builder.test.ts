import { KeepChangelogItem } from "../../src/workers/keep-changelog-builder/keep-changelog-builder";
import { MarkdownKeepChangelogBuilder } from "../../src/workers/keep-changelog-builder/markdown-keep-changelog-builder";

describe('the keep changelog builder', () => {
  it('empty returns undefined', () => {
    const keepChangelogBuilder = new MarkdownKeepChangelogBuilder();
    const result = keepChangelogBuilder.build('1.0.0', [], [], [], [], [], []);

    expect(result).toBeUndefined();
  });

  it('creates the correct changelog', () => {
    const keepChangelogBuilder = new MarkdownKeepChangelogBuilder();

    const result = keepChangelogBuilder.build(
      '1.0.0',
      [new KeepChangelogItem('Amazing feature', 'Bruno', '10/10/10', '12', "www.pudim.com.br", "http://www.image.com/")],
      [new KeepChangelogItem('Feature flag name', 'Giorno', '12/10/10', '32', "www.pudim.com.br", "http://www.image.com/")],
      [new KeepChangelogItem('Deprecated API call', 'Dio', '13/10/10', '43', "www.pudim.com.br", "http://www.image.com/")],
      [
        new KeepChangelogItem(
          'Removed support of old feature',
          'Joseph',
          '14/10/10',
          '66', "www.pudim.com.br", "http://www.image.com/"
          
        )
      ],
      [
        new KeepChangelogItem('NPE', 'Narancia', '14/10/10', '123', "www.pudim.com.br", "http://www.image.com/"),
        new KeepChangelogItem('Memory leak', 'Abacchio', '17/10/10', '67', "www.pudim.com.br", "http://www.image.com/")
      ],
      [
        new KeepChangelogItem(
          '- Secures token with BASE32',
          'Mista',
          '18/10/10',
          '98', "www.pudim.com.br", "http://www.image.com/"
        )
      ]
    );

    const expected = `## 1.0.0
### Added
- Amazing feature, by Bruno - (#12)

### Changed
- Feature flag name, by Giorno - (#32)

### Deprecated
- Deprecated API call, by Dio - (#43)

### Removed
- Removed support of old feature, by Joseph - (#66)

### Fixed
- NPE, by Narancia - (#123)
- Memory leak, by Abacchio - (#67)

### Security
- Secures token with BASE32, by Mista - (#98)`;
    expect(result).toEqual(expected);
  });
});
