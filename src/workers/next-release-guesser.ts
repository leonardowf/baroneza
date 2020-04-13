import { Observable, from } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { map } from 'rxjs/operators';
import semver from 'semver';

export interface NextReleaseGuesser {
  guess(): Observable<string>;
}

export class GithubNextReleaseGuesser implements NextReleaseGuesser {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(octokit: Octokit, repo: string, owner: string) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }

  guess(): Observable<string> {
    // https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
    const semverRegex = /w*(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    const semverFromString = (value: string): string => {
      return value.match(semverRegex) || [].length > 0
        ? value.match(semverRegex)[0]
        : null;
    };

    return from(
      this.octokit.pulls.list({
        owner: this.owner,
        repo: this.repo,
        sort: 'created',
        state: 'all',
        direction: 'desc'
      })
    )
      .pipe(map((response) => response.data.map((pull) => pull.title)))
      .pipe(
        map((titles) =>
          titles.map(semverFromString).filter((semver) => semver != null)
        )
      )
      .pipe(map((semvers) => (semvers.length > 0 ? semvers[0] : '1.0.0')))
      .pipe(map((latestSemver) => semver.inc(latestSemver, 'patch')));
  }
}
