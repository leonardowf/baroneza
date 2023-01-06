import { Observable, from, throwError, of, defer } from 'rxjs';
import JiraAPI from 'jira-client';
import { flatMap, map, mapTo } from 'rxjs/operators';

export interface JiraService {
  createVersion(name: string, projectId: number): Observable<void>;
  projectIdFromKey(projectKey: string): Observable<number>;
  hasVersion(name: string, projectKey: string): Observable<boolean>;
  hasFixVersion(issueNumber: string): Observable<boolean>;
  updateFixVersion(
    fromVersion: string,
    toVersion: string,
    projectKey: string
  ): Observable<void>;
  releaseVersion(
    name: string,
    projectKey: string,
    releaseDate?: string
  ): Observable<void>;
}

export class ConcreteJiraService implements JiraService {
  private readonly jiraAPI: JiraAPI;

  constructor(jiraAPI: JiraAPI) {
    this.jiraAPI = jiraAPI;
  }

  createVersion(name: string, projectId: number): Observable<void> {
    return defer(() =>
      from(
        this.jiraAPI.createVersion({
          projectId: projectId,
          name
        })
      ).pipe(mapTo(void 0))
    );
  }

  releaseVersion(
    name: string,
    projectKey: string,
    releaseDate?: string
  ): Observable<void> {
    return this.findVersion(name, projectKey).pipe(
      flatMap((match) =>
        this.jiraAPI.updateVersion({
          id: match.id,
          name: name,
          projectId: match.projectId,
          released: true,
          releaseDate: releaseDate
        })
      ),
      mapTo(void 0)
    );
  }

  projectIdFromKey(projectKey: string): Observable<number> {
    return defer(() =>
      from(this.jiraAPI.getProject(projectKey)).pipe(
        map((x) => {
          return x.id;
        })
      )
    );
  }

  hasVersion(name: string, projectKey: string): Observable<boolean> {
    return defer(() =>
      from(this.jiraAPI.getVersions(projectKey)).pipe(
        map((x) => {
          const versions = x as Array<JiraVersion>;
          return versions.filter((version) => version.name === name).length > 0;
        })
      )
    );
  }

  hasFixVersion(issueNumber: string): Observable<boolean> {
    return defer(() =>
      from(this.jiraAPI.findIssue(issueNumber)).pipe(
        map((jsonResponse) => {
          const jiraIssue = jsonResponse as Issue;
          return jiraIssue.fields.fixVersions.length > 0;
        })
      )
    );
  }

  updateFixVersion(
    fromVersion: string,
    toVersion: string,
    projectKey: string
  ): Observable<void> {
    return this.findVersion(fromVersion, projectKey).pipe(
      flatMap((match) =>
        this.jiraAPI.updateVersion({
          id: match.id,
          name: toVersion,
          projectId: match.projectId
        })
      ),
      mapTo(void 0)
    );
  }

  private findVersion(
    name: string,
    projectKey: string
  ): Observable<JiraVersion> {
    return defer(() =>
      from(this.jiraAPI.getVersions(projectKey)).pipe(
        flatMap((x) => {
          const versions = x as JiraVersion[];
          const match = versions.find(
            (version) => version.name.toLowerCase() === name.toLowerCase()
          );

          if (!match) {
            return throwError({
              message: `Unable to find JIRA release named ${name}`
            });
          }
          return of(match);
        })
      )
    );
  }
}

interface JiraVersion {
  readonly id: string;
  readonly name: string;
  readonly projectId: number;
}

interface Issue {
  readonly fields: Fields;
}

interface Fields {
  readonly fixVersions: FixVersion[];
}

interface FixVersion {
  readonly name: string;
}
