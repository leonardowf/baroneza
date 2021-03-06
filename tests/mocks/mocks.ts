import { GithubServiceMock } from './github-service-mock';
import { PullRequestCreatorMock } from './pull-request-creator-mock';

export class Mocks {
  static githubService(owner: string, repo: string): GithubServiceMock {
    return new GithubServiceMock(owner, repo);
  }

  static githubPullRequestCreator(): PullRequestCreatorMock {
    return new PullRequestCreatorMock();
  }
}
