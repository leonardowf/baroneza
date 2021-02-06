import { Observable } from 'rxjs';

export interface NextReleaseGuesser {
  guess(repository: string): Observable<string>;
}
