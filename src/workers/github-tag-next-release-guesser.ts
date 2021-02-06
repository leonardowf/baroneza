import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import semver from 'semver';
import { GithubService } from '../services/github-service';
import { NextReleaseGuesser } from './next-release-guesser';

export class GithubTagNextReleaseGuesser implements NextReleaseGuesser {
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(githubService: GithubService, owner: string) {
    this.githubService = githubService;
    this.owner = owner;
  }
  guess(repository: string): Observable<string> {
    return this.githubService.tags(this.owner, repository).pipe(
      map((tags) => {
        const tagsWithoutVprefix = tags.map((t) => {
          return t.replace('v', '');
        });
        const semvers = tagsWithoutVprefix
          .map((x) => semver.parse(x))
          .filter((y): y is semver.SemVer => y !== null);
        const latestSemver = semver.sort(semvers).pop();
        if (latestSemver === undefined) {
          throw new Error('No tags found in this repository');
        }

        const increased = semver.inc(latestSemver, 'patch');

        if (increased === null) {
          throw new Error('Could not increase semver version');
        }

        return increased;
      })
    );
  }
}
