import { NextReleaseGuesser } from '../../src/workers/next-release-guesser';
import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseOutput
} from '../../src/use-cases/create-release-use-case';
import {
  StartTrainUseCase,
  StartTrainUseCaseInput
} from '../../src/use-cases/start-train-use-case';
import {
  AskConfirmationUseCase,
  AskConfirmationUseCaseInput,
  AskConfirmationUseCaseOutput
} from '../../src/use-cases/ask-confirmation-use-case';
import { mock, when, instance, deepEqual, anything, verify } from 'ts-mockito';
import { of } from 'rxjs';

describe('The Start Train Use Case', () => {
  it('call things when no confirmation', (done) => {
    const nextReleaseGuesserMock = mock<NextReleaseGuesser>();
    const createReleaseUseCaseMock = mock<CreateReleaseUseCase>();
    const askConfirmationUseCaseMock = mock<AskConfirmationUseCase>();
    const branchPrefix = 'branchPrefix';
    const baseBranch = 'baseBranch';
    const targetBranch = 'targetBranch';
    const pullRequestTitlePrefix = 'pullRequestTitlePrefix';
    const project = 'project';
    const confirmationReaction = 'confirmationReaction';
    const secondsToConfirmationTimeout = 60;

    when(nextReleaseGuesserMock.guess('repository', 'patch')).thenReturn(
      of('1.0.0')
    );

    const askConfirmationUseCaseInput = new AskConfirmationUseCaseInput(
      '🚂 \nChugga chugga chugga chugga chugga choo choooooo!\n---\nThe train for version 1.0.0 will depart in 60 seconds\n---\nBe sure that everything is merged and the branches are properly aligned\n---\nReact to this message with confirmationReaction to stop the train',
      'channel'
    );
    const askConfirmationUseCaseOutput = new AskConfirmationUseCaseOutput(true);
    when(
      askConfirmationUseCaseMock.execute(deepEqual(askConfirmationUseCaseInput))
    ).thenReturn(of(askConfirmationUseCaseOutput));

    const nextReleaseGuesser = instance(nextReleaseGuesserMock);
    const createReleaseUseCase = instance(createReleaseUseCaseMock);
    const askConfirmationUseCase = instance(askConfirmationUseCaseMock);

    const sutInput: StartTrainUseCaseInput = {
      repository: 'repository',
      baseBranch: 'baseBranch',
      targetBranch: 'targetBranch',
      channel: 'channel',
      jiraTagSuffix: ' suffix',
      releaseType: 'patch',
      jiraProjectName: "jiraProjectName",
      branchPrefix: "branchPrefix",
      pullRequestTitlePrefix: "pullRequestTitlePrefix"
    };

    const sut = new StartTrainUseCase({
      nextReleaseGuesser,
      createReleaseUseCase,
      askConfirmationUseCase,
      confirmationReaction,
      secondsToConfirmationTimeout
    }
    );
    sut.execute(sutInput).subscribe({
      next: () => {
        verify(createReleaseUseCaseMock.execute(anything())).never();
      },
      complete: done
    });
  });

  it('does not call things when confirmation is true', (done) => {
    const nextReleaseGuesserMock = mock<NextReleaseGuesser>();
    const createReleaseUseCaseMock = mock<CreateReleaseUseCase>();
    const askConfirmationUseCaseMock = mock<AskConfirmationUseCase>();
    const branchPrefix = 'branchPrefix';
    const baseBranch = 'baseBranch';
    const targetBranch = 'targetBranch';
    const pullRequestTitlePrefix = 'pullRequestTitlePrefix';
    const project = 'project';
    const confirmationReaction = 'confirmationReaction';
    const secondsToConfirmationTimeout = 600000;

    when(nextReleaseGuesserMock.guess('repository', 'patch')).thenReturn(
      of('1.0.1')
    );

    const askConfirmationUseCaseInput = new AskConfirmationUseCaseInput(
      '🚂 \nChugga chugga chugga chugga chugga choo choooooo!\n---\nThe train for version 1.0.1 will depart in 600000 seconds\n---\nBe sure that everything is merged and the branches are properly aligned\n---\nReact to this message with confirmationReaction to stop the train',
      'channel'
    );
    const askConfirmationUseCaseOutput = new AskConfirmationUseCaseOutput(
      false
    );
    when(
      askConfirmationUseCaseMock.execute(deepEqual(askConfirmationUseCaseInput))
    ).thenReturn(of(askConfirmationUseCaseOutput));

    when(createReleaseUseCaseMock.execute(anything())).thenReturn(
      of(new CreateReleaseUseCaseOutput())
    );

    const nextReleaseGuesser = instance(nextReleaseGuesserMock);
    const createReleaseUseCase = instance(createReleaseUseCaseMock);
    const askConfirmationUseCase = instance(askConfirmationUseCaseMock);

    const sutInput: StartTrainUseCaseInput = {
      repository: 'repository',
      baseBranch: 'baseBranch',
      targetBranch: 'targetBranch',
      channel: 'channel',
      jiraTagSuffix: ' suffix',
      releaseType: 'patch',
      jiraProjectName: "jiraProjectName",
      branchPrefix: "branchPrefix",
      pullRequestTitlePrefix: "pullRequestTitlePrefix"
    };

    const sut = new StartTrainUseCase({
      nextReleaseGuesser,
      createReleaseUseCase,
      askConfirmationUseCase,
      confirmationReaction,
      secondsToConfirmationTimeout
    }
    );

    sut.execute(sutInput).subscribe({
      next: () => {
        verify(createReleaseUseCaseMock.execute(anything())).once();
      },
      complete: done
    });
  });
});
