import { Observable, from, throwError, of, defer } from 'rxjs';
import JiraAPI from 'jira-client';
import { catchError, flatMap, map, mapTo } from 'rxjs/operators';

export interface JiraService {
  createVersion(
    name: string,
    projectId: number,
    description?: string
  ): Observable<void>;
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

  getIssue(issueNumber: string): Observable<Issue>;
}

export type TicketDetails = {
  readonly issueNumber: string;
};

export class ConcreteJiraService implements JiraService {
  private readonly jiraAPI: JiraAPI;

  constructor(jiraAPI: JiraAPI) {
    this.jiraAPI = jiraAPI;
  }

  createVersion(
    name: string,
    projectId: number,
    description?: string
  ): Observable<void> {
    return defer(() =>
      from(
        this.jiraAPI.createVersion({
          projectId: projectId,
          description,
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

  getIssue(ticket: string): Observable<Issue> {
    return defer(() =>
      from(this.jiraAPI.findIssue(ticket)).pipe(
        map((jsonResponse) => {
          const jiraIssue = jsonResponse as Issue;
          return jiraIssue;
        }),
        catchError((error) => {
          return throwError({
            message: `Unable to find JIRA issue ${ticket}`
          });
        })
      )
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
              message: `Unable to find JIRA release named ${name} for projectKey ${projectKey}`
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

export interface Project {
  readonly key: string;
  readonly name: string;
}

export interface Status {
  readonly name: string;
}

export interface Issue {
  readonly key: string;
  readonly fields: Fields;
}

export interface Fields {
  readonly fixVersions: FixVersion[];
  readonly project: Project;
  readonly status: Status;
  readonly summary: string;
}

export interface FixVersion {
  readonly name: string;
}
