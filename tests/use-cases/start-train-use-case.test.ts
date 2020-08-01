import {NextReleaseGuesser} from '../../src/workers/next-release-guesser';
import {CreateReleaseUseCase, CreateReleaseUseCaseOutput} from '../../src/use-cases/create-release-use-case';
import {StartTrainUseCase, StartTrainUseCaseInput} from '../../src/use-cases/start-train-use-case';
import {AskConfirmationUseCase, AskConfirmationUseCaseInput, AskConfirmationUseCaseOutput} from '../../src/use-cases/ask-confirmation-use-case';
import { mock, when, instance, deepEqual, anything, verify } from 'ts-mockito'
import { of } from 'rxjs';

describe('The Start Train Use Case', () => {
    it('does not call things when no confirmation', (done) => {
        const nextReleaseGuesserMock = mock<NextReleaseGuesser>()
        const createReleaseUseCaseMock = mock<CreateReleaseUseCase>()
        const askConfirmationUseCaseMock = mock<AskConfirmationUseCase>()
        const branchPrefix = "branchPrefix"
        const baseBranch = "baseBranch"
        const targetBranch = "targetBranch"
        const pullRequestTitlePrefix = "pullRequestTitlePrefix"
        const project = "project"
        const confirmationReaction = "confirmationReaction"

        when(nextReleaseGuesserMock.guess("repository")).thenReturn(of("1.0.0"))

        const askConfirmationUseCaseInput = new AskConfirmationUseCaseInput("Would you like to start the release train for version 1.0.0? confirmationReaction to continue!", "channel")
        const askConfirmationUseCaseOutput = new AskConfirmationUseCaseOutput(false)
        when(askConfirmationUseCaseMock.execute(deepEqual(askConfirmationUseCaseInput))).thenReturn(of(askConfirmationUseCaseOutput))

        const nextReleaseGuesser = instance(nextReleaseGuesserMock)
        const createReleaseUseCase = instance(createReleaseUseCaseMock)
        const askConfirmationUseCase = instance(askConfirmationUseCaseMock)
        
        const sutInput = new StartTrainUseCaseInput("repository", "baseBranch", "targetBranch", "channel")
        const sut = new StartTrainUseCase(nextReleaseGuesser, createReleaseUseCase, askConfirmationUseCase, branchPrefix, baseBranch, targetBranch, pullRequestTitlePrefix, project, confirmationReaction).execute(sutInput).subscribe({
            next: (result) => {
                verify(createReleaseUseCaseMock.execute(anything())).never()
            },
            complete: done
        })
    });

    it('call things when confirmation is true', (done) => {
        const nextReleaseGuesserMock = mock<NextReleaseGuesser>()
        const createReleaseUseCaseMock = mock<CreateReleaseUseCase>()
        const askConfirmationUseCaseMock = mock<AskConfirmationUseCase>()
        const branchPrefix = "branchPrefix"
        const baseBranch = "baseBranch"
        const targetBranch = "targetBranch"
        const pullRequestTitlePrefix = "pullRequestTitlePrefix"
        const project = "project"
        const confirmationReaction = "confirmationReaction"

        when(nextReleaseGuesserMock.guess("repository")).thenReturn(of("1.0.0"))

        const askConfirmationUseCaseInput = new AskConfirmationUseCaseInput("Would you like to start the release train for version 1.0.0? confirmationReaction to continue!", "channel")
        const askConfirmationUseCaseOutput = new AskConfirmationUseCaseOutput(true)
        when(askConfirmationUseCaseMock.execute(deepEqual(askConfirmationUseCaseInput))).thenReturn(of(askConfirmationUseCaseOutput))

        when(createReleaseUseCaseMock.execute(anything())).thenReturn(of(new CreateReleaseUseCaseOutput()))

        const nextReleaseGuesser = instance(nextReleaseGuesserMock)
        const createReleaseUseCase = instance(createReleaseUseCaseMock)
        const askConfirmationUseCase = instance(askConfirmationUseCaseMock)
        
        const sutInput = new StartTrainUseCaseInput("repository", "baseBranch", "targetBranch", "channel")
        const sut = new StartTrainUseCase(nextReleaseGuesser, createReleaseUseCase, askConfirmationUseCase, branchPrefix, baseBranch, targetBranch, pullRequestTitlePrefix, project, confirmationReaction).execute(sutInput).subscribe({
            next: (result) => {
                verify(createReleaseUseCaseMock.execute(anything())).once()
            },
            complete: done
        })
    });
});