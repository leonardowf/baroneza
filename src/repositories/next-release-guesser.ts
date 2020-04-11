import { Observable, of } from 'rxjs';

export interface NextReleaseGuesser {
  guess(): Observable<string>;
}

export class GithubNextReleaseGuesser implements NextReleaseGuesser {
  guess(): Observable<string> {
    return of('1.0');
  }
}
