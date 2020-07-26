import { from } from 'rxjs';
import {
  ConcreteKeepChangelogBuilder,
  KeepChangelogItem
} from '../../src/workers/keep-changelog-builder';

describe('the keep changelog builder', () => {
  it('creates the correct changelog', () => {
    const keepChangelogBuilder = new ConcreteKeepChangelogBuilder();

    const result = keepChangelogBuilder.build(
      '1.0.0',
      [new KeepChangelogItem('Amazing feature', "Bruno", "10/10/10", "12")],
      [new KeepChangelogItem('Feature flag name', "Giorno", "12/10/10", "32")],
      [new KeepChangelogItem('Deprecated API call', "Dio", "13/10/10", "43")],
      [new KeepChangelogItem('Removed support of old feature', "Joseph", "14/10/10", "66")],
      [new KeepChangelogItem('NPE', "Narancia", "14/10/10", "123"), new KeepChangelogItem('Memory leak', "Abacchio", "17/10/10", "67")],
      [new KeepChangelogItem('Secures token with BASE32', "Mista", "18/10/10", "98")],
    );

    const expected = 
`## 1.0.0
### Added
Amazing feature, by Bruno, 10/10/10, (#12)

### Changed
Feature flag name, by Giorno, 12/10/10, (#32)

### Deprecated
Deprecated API call, by Dio, 13/10/10, (#43)

### Removed
Removed support of old feature, by Joseph, 14/10/10, (#66)

### Fixed
NPE, by Narancia, 14/10/10, (#123)
Memory leak, by Abacchio, 17/10/10, (#67)

### Security
Secures token with BASE32, by Mista, 18/10/10, (#98)`
    expect(result).toEqual(expected)
  });
});
