import { Observable, throwError } from 'rxjs';
import {
  NextReleaseGuesser,
  ReleaseType
} from '../workers/next-release-guesser';
import { catchError, map } from 'rxjs/operators';

export interface GuessNextReleaseEndpointInput {
  readonly repository: string;
  readonly releaseType: ReleaseType;
}

export type GuessNextReleaseEndpointOutput = {
  readonly guessedNextRelease: string;
};

export interface GuessNextReleaseEndpointDependencies {
  readonly nextReleaseGuesser: NextReleaseGuesser;
}

export class GuessNextReleaseEndpoint {
  private nextReleaseGuesser: NextReleaseGuesser;

  constructor(dependencies: GuessNextReleaseEndpointDependencies) {
    this.nextReleaseGuesser = dependencies.nextReleaseGuesser;
  }

  execute(
    input: GuessNextReleaseEndpointInput
  ): Observable<GuessNextReleaseEndpointOutput> {
    return this.nextReleaseGuesser
      .guess(input.repository, input.releaseType)
      .pipe(
        map((nextReleaseGuesserOutput) => {
          return {
            guessedNextRelease: nextReleaseGuesserOutput
          };
        }),
        catchError((error) => {
          return throwError({
            message: error.message ?? 'Unable to guess the next release'
          });
        })
      );
  }
}
