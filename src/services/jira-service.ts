import { Observable, from, throwError, forkJoin } from 'rxjs';
import JiraAPI from 'jira-client';
import { flatMap, map, mapTo } from 'rxjs/operators';

export interface JiraService {
  createVersion(name: string, projectId: number): Observable<void>;
  projectIdFromKey(project: string): Observable<number>;
  hasVersion(name: string, project: string): Observable<boolean>;
  hasFixVersion(issueNumber: string): Observable<boolean>;
  updateFixVersion(
    fromVersion: string,
    toVersion: string,
    projectKeys: string[]
  ): Observable<void>;
}

export class ConcreteJiraService implements JiraService {
  private readonly jiraAPI: JiraAPI;

  constructor(jiraAPI: JiraAPI) {
    this.jiraAPI = jiraAPI;
  }

  createVersion(name: string, projectId: number): Observable<void> {
    return from(
      this.jiraAPI.createVersion({
        projectId: projectId,
        name
      })
    ).pipe(mapTo(void 0));
  }

  projectIdFromKey(project: string): Observable<number> {
    return from(this.jiraAPI.getProject(project)).pipe(
      map((x) => {
        return x.id;
      })
    );
  }

  hasVersion(name: string, project: string): Observable<boolean> {
    return from(this.jiraAPI.getVersions(project)).pipe(
      map((x) => {
        const versions = x as Array<JiraVersion>;
        return versions.filter((version) => version.name === name).length > 0;
      })
    );
  }

  hasFixVersion(issueNumber: string): Observable<boolean> {
    return from(this.jiraAPI.findIssue(issueNumber)).pipe(
      map((jsonResponse) => {
        const jiraIssue = jsonResponse as Issue;
        return jiraIssue.fields.fixVersions.length > 0;
      })
    );
  }

  updateFixVersion(
    fromVersion: string,
    toVersion: string,
    projectKeys: string[]
  ): Observable<void> {
    const fixObservables = projectKeys.map((projectKey) =>
      from(this.jiraAPI.getVersions(projectKey)).pipe(
        flatMap((x) => {
          const versions = x as JiraVersion[];
          const match = versions.find(
            (version) =>
              version.name.toLowerCase() === fromVersion.toLowerCase()
          );
          if (match) {
            return this.jiraAPI.updateVersion({
              id: match.id,
              name: toVersion,
              projectId: match.projectId
            });
          }

          return throwError({
            message: `Unable to find JIRA release named ${fromVersion}`
          });
        })
      )
    );
    return forkJoin(fixObservables).pipe(mapTo(void 0));
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
