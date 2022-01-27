import {
  JiraCreateVersionUseCase,
  CreateVersionUseCaseInput
} from '../../src/use-cases/create-version-use-case';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import { JiraService } from '../../src/services/jira-service';
import { of } from 'rxjs';

describe('the create version use case', () => {
  it('does not call the service if version exists', (done) => {
    const jiraServiceMock = mock<JiraService>();

    when(jiraServiceMock.hasVersion(anything(), anything())).thenReturn(
      of(true)
    );
    when(jiraServiceMock.projectIdFromKey(anything())).thenReturn(of(123));

    const jiraService = instance(jiraServiceMock);
    const sut = new JiraCreateVersionUseCase(jiraService);

    sut
      .execute(
        new CreateVersionUseCaseInput(['project', 'otherProject'], 'version')
      )
      .subscribe({
        next: () => {
          verify(jiraServiceMock.createVersion(anything(), anything())).never();
        },
        complete: done
      });
  });

  it('calls the service if version does not exist', (done) => {
    const jiraServiceMock = mock<JiraService>();

    when(jiraServiceMock.hasVersion(anything(), anything())).thenReturn(
      of(false)
    );
    when(jiraServiceMock.projectIdFromKey(anything())).thenReturn(of(123));
    when(jiraServiceMock.createVersion(anything(), anything())).thenReturn(
      of(void 0)
    );

    const jiraService = instance(jiraServiceMock);
    const sut = new JiraCreateVersionUseCase(jiraService);

    sut
      .execute(
        new CreateVersionUseCaseInput(['project', 'otherProject'], 'version')
      )
      .subscribe({
        next: () => {
          verify(jiraServiceMock.createVersion(anything(), anything())).twice();
        },
        complete: done
      });
  });
});
