import { anything, verify } from 'ts-mockito';
import { JiraService } from '../../src/services/jira-service';
import { ConcreteReleaseVersionUseCase } from '../../src/use-cases/release-version-use-case';
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
      const sut = new ConcreteReleaseVersionUseCase(jiraService);
      sut
        .execute({
          projectKeys: ['pass'],
          version: '1.0.0',
          releaseDate: undefined
        })
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

    it('does not fail the use case', (done) => {
      const sut = new ConcreteReleaseVersionUseCase(jiraService);
      sut
        .execute({
          projectKeys: ['projectKey'],
          version: 'version',
          releaseDate: 'releaseDate'
        })
        .subscribe({
          next: (x) => {
            expect(x.result[0].projectKey).toBe('projectKey');
            expect(x.result[0].result).toBe('FAILED');
            done();
          },
          error: () => {
            fail();
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

    it('does not fail the use case', (done) => {
      const sut = new ConcreteReleaseVersionUseCase(jiraService);
      sut
        .execute({
          projectKeys: ['fail', 'pass'],
          version: '1.0.0',
          releaseDate: undefined
        })
        .subscribe({
          next: (x) => {
            expect(x.result[0].projectKey).toBe('fail');
            expect(x.result[0].result).toBe('FAILED');
            expect(x.result[1].projectKey).toBe('pass');
            expect(x.result[1].result).toBe('RELEASED');

            verify(
              jiraServiceMock.mock.releaseVersion(
                anything(),
                anything(),
                anything()
              )
            ).twice();
            done();
          },
          error: () => {
            fail();
          }
        });
    });
  });
});
