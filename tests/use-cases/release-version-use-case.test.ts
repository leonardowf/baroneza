import { anything, verify } from 'ts-mockito';
import { JiraService } from '../../src/services/jira-service';
import {
  ReleaseVersionUseCase,
  ReleaseVersionUseCaseInput
} from '../../src/use-cases/release-version-use-case';
import { JiraServiceMock } from '../mocks/jira-service-mock';
import { Mocks } from '../mocks/mocks';

describe('the release version use case', () => {
  let jiraServiceMock: JiraServiceMock;

  beforeEach(() => {
    jiraServiceMock = Mocks.jiraService();
  });

  describe('with success jira service', () => {
    let jiraService: JiraService;

    beforeEach(() => {
      jiraService = jiraServiceMock
        .passingReleaseVersion({
          name: '1.0.0',
          projectKey: 'pass',
          releaseDate: undefined
        })
        .build();
    });

    it('does not fail the use case', (done) => {
      const sut = new ReleaseVersionUseCase(jiraService);
      sut
        .execute(new ReleaseVersionUseCaseInput(['pass'], '1.0.0', undefined))
        .subscribe({
          next: () => {
            done();
          },
          error: () => {
            fail();
          }
        });
    });
  });

  describe('with failing jira service', () => {
    let jiraService: JiraService;
    beforeEach(() => {
      jiraService = jiraServiceMock
        .failingReleaseVersion({
          name: 'version',
          projectKey: 'projectKey',
          releaseDate: 'releaseDate'
        })
        .build();
    });

    it('fails the use case', (done) => {
      const sut = new ReleaseVersionUseCase(jiraService);
      sut
        .execute(
          new ReleaseVersionUseCaseInput(
            ['projectKey'],
            'version',
            'releaseDate'
          )
        )
        .subscribe({
          next: () => {
            fail();
          },
          error: () => {
            done();
          }
        });
    });
  });

  describe('with intermitent jira service', () => {
    let jiraService: JiraService;
    beforeEach(() => {
      jiraService = jiraServiceMock
        .failingReleaseVersion({
          name: '1.0.0',
          projectKey: 'fail',
          releaseDate: undefined
        })
        .passingReleaseVersion({
          name: '1.0.0',
          projectKey: 'pass',
          releaseDate: undefined
        })
        .build();
    });

    it('fails the use case', (done) => {
      const sut = new ReleaseVersionUseCase(jiraService);
      sut
        .execute(
          new ReleaseVersionUseCaseInput(['fail', 'pass'], '1.0.0', undefined)
        )
        .subscribe({
          next: () => {
            fail();
          },
          error: () => {
            verify(
              jiraServiceMock.mock.releaseVersion(
                anything(),
                anything(),
                anything()
              )
            ).twice();
            done();
          }
        });
    });
  });
});
