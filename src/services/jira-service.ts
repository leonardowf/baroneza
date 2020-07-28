import { Observable, from } from 'rxjs';
import JiraAPI from 'jira-client';
import { map, mapTo } from 'rxjs/operators';

export interface JiraService {
  createVersion(name: string, projectId: number): Observable<void>;
  projectId(project: string): Observable<number>;
  hasVersion(name: string, project: string): Observable<boolean>;
}

export class ConcreteJiraService {
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

  projectId(project: string): Observable<number> {
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
}

interface JiraVersion {
  name: string;
}
