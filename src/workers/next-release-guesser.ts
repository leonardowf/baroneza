import { Observable } from 'rxjs';

export type ReleaseType = 'major' | 'minor' | 'patch' | 'prerelease';
export interface NextReleaseGuesser {
  guess(repository: string, releaseType: ReleaseType): Observable<string>;
}
