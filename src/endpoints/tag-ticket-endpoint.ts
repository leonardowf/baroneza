import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JiraTicketTagger } from '../workers/jira-tagger';

export interface TagTicketEndpointInput {
  readonly jiraTagSuffix: string;
  readonly tag: string;
  readonly jiraTicket: string;
}

export interface TagTicketEndpointDependencies {
  readonly jiraTicketTagger: JiraTicketTagger;
}

export type TagTicketEndpointResponse = {};

export class TagTicketEndpoint {
  private readonly jiraTicketTagger: JiraTicketTagger;

  constructor(dependencies: TagTicketEndpointDependencies) {
    this.jiraTicketTagger = dependencies.jiraTicketTagger;
  }

  execute(
    input: TagTicketEndpointInput
  ): Observable<TagTicketEndpointResponse> {
    return this.jiraTicketTagger.tag([input.jiraTicket], input.tag).pipe(
      map(() => {
        return {};
      }),
      catchError((err) => {
        console.log(err);
        return throwError(err);
      })
    );
  }
}
