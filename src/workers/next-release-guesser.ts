import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import semver from 'semver';
import { GithubService } from '../services/github-service';

export interface NextReleaseGuesser {
  guess(): Observable<string>;
}

export class GithubNextReleaseGuesser implements NextReleaseGuesser {
  private readonly githubService: GithubService;
  private readonly owner: string;
  private readonly repo: string;

  constructor(githubService: GithubService, repo: string, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
    this.repo = repo;
  }

  guess(): Observable<string> {
    // https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
    const semverRegex = /w*(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    const semverFromString = (value: string): string | null => {
      return value.match(semverRegex) || [].length > 0
        ? value.match(semverRegex)![0]
        : null;
    };

    return this.githubService
      .pullRequestTitles(this.owner, this.repo)
      .pipe(
        map((titles) =>
          titles
            .map(semverFromString)
            .filter((semver) => semver != null)
            .filter((x): x is string => x !== null)
        )
      )
      .pipe(
        map((semvers) => {
          if (semvers.length > 0) {
            return semvers[0];
          }
          throw new Error('Unable to find semvers in the PR titles');
        })
      )
      .pipe(
        map((latestSemver) => {
          const increasedSemver = semver.inc(latestSemver, 'patch');
          if (increasedSemver == null) {
            throw new Error('Unable to increase semver');
          }
          return increasedSemver!;
        })
      );
  }
}
