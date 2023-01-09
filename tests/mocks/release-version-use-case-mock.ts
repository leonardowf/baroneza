import { of, throwError } from 'rxjs';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import {
  ReleaseVersionUseCase,
  ReleaseVersionUseCaseInput,
  ReleaseVersionUseCaseOutput
} from '../../src/use-cases/release-version-use-case';

export class ReleaseVersionUseCaseMock {
  mock: ReleaseVersionUseCase;

  constructor() {
    this.mock = mock<ReleaseVersionUseCase>();
  }

  withError(input: ReleaseVersionUseCaseInput): ReleaseVersionUseCaseMock {
    when(this.mock.execute(deepEqual(input))).thenReturn(
      throwError(new Error('this is an error'))
    );
    return this;
  }

  withInputOutput(arg: {
    input: ReleaseVersionUseCaseInput;
    output: ReleaseVersionUseCaseOutput;
  }): ReleaseVersionUseCaseMock {
    when(this.mock.execute(deepEqual(arg.input))).thenReturn(of(arg.output));
    return this;
  }

  build(): ReleaseVersionUseCase {
    return instance(this.mock);
  }
}
