import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { sort, inc } from 'semver';
import { GithubService } from '../services/github-service';
import { NextReleaseGuesser, ReleaseType } from './next-release-guesser';

export class GithubDraftReleaseGuesser implements NextReleaseGuesser {
  readonly githubService: GithubService;
  readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }

  guess(repository: string, releaseType: ReleaseType): Observable<string> {
    const latestRelease = this.githubService.latestRelease(
      this.owner,
      repository
    );

    const sortedReleases = this.githubService
      .releases(this.owner, repository)
      .pipe(
        map((releases) => {
          const filtered = releases.filter((release) => release);
          const sorted = sort(filtered);
          return sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
        }),
        map((release) => {
          if (release) {
            return release;
          }

          throw new Error(
            'GithubDraftReleaseGuesser - Unable to find most recent release'
          );
        })
      );

    const max = zip(latestRelease, sortedReleases).pipe(
      map(([latest, sorted]) => {
        return sort([latest, sorted])[1];
      })
    );

    return max.pipe(
      map((release) => inc(release, releaseType)),
      map((semver) => {
        if (semver) {
          return semver;
        }

        throw new Error(
          'GithubDraftReleaseGuesser - Unable to increase release'
        );
      })
    );
  }
}
