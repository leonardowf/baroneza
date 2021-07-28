import {
  StartTrainEndpoint,
  StartTrainDependencies
} from '../../src/endpoints/start-train-endpoint';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import {
  StartTrainUseCase,
  StartTrainUseCaseOutput,
  StartTrainUseCaseInput
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
  TagEndpointDependencies,
  TagEndpointInput
} from '../../src/endpoints/tag-endpoint';
import { TagUseCase, TagUseCaseOutput } from '../../src/use-cases/tag-use-case';

class TestStartTrainEndpointDependencies implements StartTrainDependencies {
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
  referenceBranch = 'referenceBranch';
  title = 'title';
  targetBranch = 'targetBranch';
  projectTag = 'projectTag';
  project = 'project';
  repository = 'repository';
  channel = 'channel';
  jiraTagSuffix = ' suffix';
}

class TestTagEndpointDependencies implements TagEndpointDependencies {
  tagUseCaseMock = mock<TagUseCase>();
  tagUseCase = instance(this.tagUseCaseMock);
  project = 'project';
}

class TestTagEndpointInput implements TagEndpointInput {
  number = 123;
  tag = 'tag';
  repository = 'repository';
  jiraTagSuffix = ' suffix';
}

describe('The start traint endpoint', () => {
  it('maps to the correct use case', (done) => {
    const dependencies = new TestStartTrainEndpointDependencies();

    when(dependencies.startTrainUseCaseMock.execute(anything())).thenReturn(
      of(new StartTrainUseCaseOutput())
    );

    const sut = new StartTrainEndpoint(dependencies);

    sut
      .execute(
        new StartTrainUseCaseInput(
          'repo',
          'baseBranch',
          'targetBranch',
          'channel',
          ' suffix',
          'patch'
        )
      )
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
      of(new TagUseCaseOutput([], []))
    );

    const sut = new TagEndpoint(dependencies);

    sut.execute(new TestTagEndpointInput()).subscribe({
      complete: () => {
        verify(dependencies.tagUseCaseMock.execute(anything())).once();
        done();
      }
    });
  });
});
