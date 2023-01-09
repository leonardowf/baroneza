import {
  StartTrainEndpoint,
  StartTrainEndpointDependencies
} from '../../src/endpoints/start-train-endpoint';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import {
  StartTrainUseCase,
  StartTrainUseCaseOutput
} from '../../src/use-cases/start-train-use-case';
import { of } from 'rxjs';
import {
  CreateReleaseEndpoint,
  CreateReleaseEndpointDependencies,
  CreateReleaseEndpointInput
} from '../../src/endpoints/create-release-endpoint';
import { CreateReleaseUseCase } from '../../src/use-cases/create-release-use-case';
import { CreateBranchUseCaseOutput } from '../../src/use-cases/create-branch-use-case';
import {
  TagEndpoint,
  TagEndpointDependencies
} from '../../src/endpoints/tag-endpoint';
import { TagUseCase, TagUseCaseOutput } from '../../src/use-cases/tag-use-case';
import { ReleaseVersionEndpoint } from '../../src/endpoints/release-version-endpoint';
import { Mocks } from '../mocks/mocks';

class TestStartTrainEndpointDependencies
  implements StartTrainEndpointDependencies {
  startTrainUseCaseMock = mock<StartTrainUseCase>();
  startTrainUseCase = instance(this.startTrainUseCaseMock);
}

class TestCreateReleaseDependencies
  implements CreateReleaseEndpointDependencies {
  createReleaseUseCaseMock = mock<CreateReleaseUseCase>();
  createReleaseUseCase = instance(this.createReleaseUseCaseMock);
}

class TestCreateReleaseInput implements CreateReleaseEndpointInput {
  branchName = 'branchName';
  channel = 'channel';
  jiraTagSuffix = ' suffix';
  projectKeys = ['project'];
  projectTag = 'projectTag';
  referenceBranch = 'referenceBranch';
  repository = 'repository';
  targetBranch = 'targetBranch';
  title = 'title';
}

class TestTagEndpointDependencies implements TagEndpointDependencies {
  tagUseCaseMock = mock<TagUseCase>();
  tagUseCase = instance(this.tagUseCaseMock);
}

describe('The start traint endpoint', () => {
  it('maps to the correct use case', (done) => {
    const dependencies = new TestStartTrainEndpointDependencies();

    when(dependencies.startTrainUseCaseMock.execute(anything())).thenReturn(
      of(new StartTrainUseCaseOutput())
    );

    const sut = new StartTrainEndpoint(dependencies);

    sut
      .execute({
        baseBranch: 'baseBranch',
        branchPrefix: 'branchPrefix',
        channel: 'channel',
        projectKeys: ['jiraProjectName'],
        jiraTagSuffix: ' suffix',
        pullRequestTitlePrefix: 'pullRequestTitlePrefix',
        releaseType: 'patch',
        repository: 'repo',
        targetBranch: 'targetBranch'
      })
      .subscribe({
        complete: () => {
          verify(dependencies.startTrainUseCaseMock.execute(anything())).once();
          done();
        }
      });
  });
});

describe('The create release endpoint', () => {
  it('maps to the correct use case', (done) => {
    const dependencies = new TestCreateReleaseDependencies();

    when(dependencies.createReleaseUseCaseMock.execute(anything())).thenReturn(
      of(new CreateBranchUseCaseOutput())
    );

    const sut = new CreateReleaseEndpoint(dependencies);

    sut.execute(new TestCreateReleaseInput()).subscribe({
      complete: () => {
        verify(
          dependencies.createReleaseUseCaseMock.execute(anything())
        ).once();
        done();
      }
    });
  });
});

describe('The tag endpoint', () => {
  it('maps to the correct use case', (done) => {
    const dependencies = new TestTagEndpointDependencies();

    when(dependencies.tagUseCaseMock.execute(anything())).thenReturn(
      of(new TagUseCaseOutput([], [], []))
    );

    const sut = new TagEndpoint(dependencies);

    sut
      .execute({
        jiraTagSuffix: 'jiraTagSuffix',
        reference: 123,
        projectKeys: ['project'],
        repository: 'repository',
        tag: 'tag'
      })
      .subscribe({
        complete: () => {
          verify(dependencies.tagUseCaseMock.execute(anything())).once();
          done();
        }
      });
  });
});

describe('the release version endpoint', () => {
  it('calls the correct use case then errors out', (done) => {
    const releaseVersionUseCase = Mocks.releaseVersionUseCase()
      .withError({
        projectKeys: ['FAI'],
        version: '1.0.0',
        releaseDate: undefined
      })
      .build();

    const sut = new ReleaseVersionEndpoint({
      releaseVersionUseCase: releaseVersionUseCase
    });

    sut
      .execute({
        tag: '1.0.0',
        projectKeys: ['FAI'],
        jiraTagSuffix: ''
      })
      .subscribe({
        next: () => {
          fail();
        },
        error: () => {
          done();
        }
      });
  });

  it('maps the use case response', (done) => {
    const releaseVersionUseCase = Mocks.releaseVersionUseCase()
      .withInputOutput({
        input: {
          projectKeys: ['FAI', 'PAS'],
          version: '1.0.0',
          releaseDate: undefined
        },
        output: {
          result: [
            { projectKey: 'FAI', result: 'FAILED' },
            { projectKey: 'PAS', result: 'RELEASED' }
          ]
        }
      })
      .build();

    const sut = new ReleaseVersionEndpoint({
      releaseVersionUseCase: releaseVersionUseCase
    });

    sut
      .execute({
        tag: '1.0.0',
        projectKeys: ['FAI', 'PAS'],
        jiraTagSuffix: ''
      })
      .subscribe({
        next: (response) => {
          expect(response.failures[0]).toBe('FAI');
          expect(response.successes[0]).toBe('PAS');
        },
        error: () => {
          fail();
        },
        complete: done
      });
  });
});
