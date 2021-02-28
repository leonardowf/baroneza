import { of } from 'rxjs';
import { anyString, instance, mock, when } from 'ts-mockito';
import { GithubPullRequestCreator } from '../../src/workers/pull-request-creator';

export class PullRequestCreatorMock {
  pullRequestCreator: GithubPullRequestCreator;

  constructor() {
    this.pullRequestCreator = mock<GithubPullRequestCreator>();
  }

  build(): GithubPullRequestCreator {
    return instance(this.pullRequestCreator);
  }

  succesful(): PullRequestCreatorMock {
    when(
      this.pullRequestCreator.create(anyString(), 'head', 'base', 'repo')
    ).thenReturn(of({ pullRequestNumber: 1, id: 1 }));
    return this;
  }
}
