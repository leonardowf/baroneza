import { of, throwError } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { JiraService } from '../../src/services/jira-service';

export class JiraServiceMock {
  mock: JiraService;

  constructor() {
    this.mock = mock<JiraService>();
  }

  build(): JiraService {
    return instance(this.mock);
  }

  failingReleaseVersion(input: {
    name: string;
    projectKey: string;
    releaseDate?: string | undefined;
  }): JiraServiceMock {
    when(
      this.mock.releaseVersion(input.name, input.projectKey, input.releaseDate)
    ).thenReturn(throwError('Unknown version'));

    return this;
  }

  passingReleaseVersion(input: {
    name: string;
    projectKey: string;
    releaseDate?: string | undefined;
  }): JiraServiceMock {
    when(
      this.mock.releaseVersion(input.name, input.projectKey, input.releaseDate)
    ).thenReturn(of(void 0));
    return this;
  }
}
