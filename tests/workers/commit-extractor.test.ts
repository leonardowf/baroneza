import { GithubService } from '../../src/services/github-service';
import { mock, instance, when } from 'ts-mockito';
import { of } from 'rxjs';
import { GithubPullRequestExtractor } from '../../src/workers/commit-extractor';

describe('The Github extractor', () => {
  it('calls the github service', (done) => {
    const githubServiceMock = mock<GithubService>();

    when(
      githubServiceMock.listCommitMessagesFromPullNumber(
        'owner',
        'repository',
        1
      )
    ).thenReturn(of(['commit message']));

    const githubService = instance(githubServiceMock);
    const sut = new GithubPullRequestExtractor(githubService, 'owner');

    sut.commits(1, 'repository').subscribe({
      next: (result) => {
        expect(result).toStrictEqual(['commit message']);
        done();
      }
    });
  });
});
