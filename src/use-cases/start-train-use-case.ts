import { Observable, of } from 'rxjs';
import {
  NextReleaseGuesser,
  ReleaseType
} from '../workers/next-release-guesser';
import { flatMap } from 'rxjs/operators';
import {
  CreateReleaseUseCase,
  CreateReleaseUseCaseInput
} from './create-release-use-case';
import {
  AskConfirmationUseCase,
  AskConfirmationUseCaseInput
} from './ask-confirmation-use-case';

export type StartTrainUseCaseInput = {
  baseBranch: string;
  branchPrefix: string;
  channel: string;
  projectKeys: string[];
  jiraTagSuffix: string;
  pullRequestTitlePrefix: string;
  releaseType: ReleaseType;
  repository: string;
  targetBranch: string;
};

export class StartTrainUseCaseOutput {}

export type StartTrainUseCaseDependencies = {
  nextReleaseGuesser: NextReleaseGuesser;
  createReleaseUseCase: CreateReleaseUseCase;
  askConfirmationUseCase: AskConfirmationUseCase;
  confirmationReaction: string;
  secondsToConfirmationTimeout: number;
};

export class StartTrainUseCase {
  readonly dependencies: StartTrainUseCaseDependencies;

  constructor(dependencies: StartTrainUseCaseDependencies) {
    this.dependencies = dependencies;
  }

  execute(input: StartTrainUseCaseInput): Observable<StartTrainUseCaseOutput> {
    return this.dependencies.nextReleaseGuesser
      .guess(input.repository, input.releaseType)
      .pipe(
        flatMap((version) => {
          const copy = this.confirmationCopyMaker(version);
          return this.dependencies.askConfirmationUseCase
            .execute(new AskConfirmationUseCaseInput(copy, input.channel))
            .pipe(
              flatMap((confirmationRequest) => {
                if (!confirmationRequest.reacted) {
                  return this.dependencies.createReleaseUseCase.execute(
                    new CreateReleaseUseCaseInput(
                      `${input.branchPrefix}${version}`,
                      input.baseBranch,
                      input.targetBranch,
                      `${input.pullRequestTitlePrefix} ${version}`,
                      version,
                      input.projectKeys,
                      input.repository,
                      input.channel,
                      input.jiraTagSuffix
                    )
                  );
                } else {
                  return of(new StartTrainUseCaseOutput());
                }
              })
            );
        })
      );
  }

  private confirmationCopyMaker(version: string): string {
    return (
      `🚂 \n` +
      'Chugga chugga chugga chugga chugga choo choooooo!\n' + // TODO: agree on how many chuggas before a choo choo
      `---\n` +
      `The train for version ${version} will depart in ${this.dependencies.secondsToConfirmationTimeout} seconds\n` +
      `---\n` +
      'Be sure that everything is merged and the branches are properly aligned\n' +
      `---\n` +
      `React to this message with ${this.dependencies.confirmationReaction} to stop the train`
    );
  }
}
