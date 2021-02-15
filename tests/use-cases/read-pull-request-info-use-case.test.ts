import { GithubPullRequestInfoUseCase } from '../../src/use-cases/read-pull-request-info-use-case';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';
import { of, throwError } from 'rxjs';

describe('The read pull request info use case', () => {
  it('executes correctly', (done) => {
    const githubServiceMock = mock<GithubService>();
    const githubService = instance(githubServiceMock);

    when(githubServiceMock.pullRequestData('owner', 'repo', 123)).thenReturn(
      of({
        number: 123,
        login: 'login',
        description: 'description',
        mergedAt: 'mergedAt',
        url: 'www.pudim.com.br',
        authorImageUrl: 'www.image.com'
      })
    );

    const sut = new GithubPullRequestInfoUseCase(githubService, 'owner');

    sut.execute([123], 'repo').subscribe({
      next: (result) => {
        expect(result.pullRequests[0].author).toEqual('login');
        expect(result.pullRequests[0].date).toEqual('mergedAt');
        expect(result.pullRequests[0].description).toEqual('description');
        expect(result.pullRequests[0].identifier).toEqual(123);

        verify(
          githubServiceMock.pullRequestData(anything(), anything(), anything())
        ).once();
      },
      complete: done
    });
  });

  it('with error executes correctly', (done) => {
    const githubServiceMock = mock<GithubService>();
    const githubService = instance(githubServiceMock);

    when(githubServiceMock.pullRequestData('owner', 'repo', 123))
      .thenReturn(throwError('Error'))
      .thenReturn(
        of({
          number: 123,
          login: 'login',
          description: 'description',
          mergedAt: 'mergedAt',
          url: 'www.pudim.com.br',
          authorImageUrl: 'www.image.com'
        })
      );

    const sut = new GithubPullRequestInfoUseCase(githubService, 'owner');

    sut.execute([123, 123], 'repo').subscribe({
      next: (result) => {
        expect(result.pullRequests.length).toEqual(1);
        expect(result.pullRequests[0].author).toEqual('login');
        expect(result.pullRequests[0].date).toEqual('mergedAt');
        expect(result.pullRequests[0].description).toEqual('description');
        expect(result.pullRequests[0].identifier).toEqual(123);
        verify(
          githubServiceMock.pullRequestData(anything(), anything(), anything())
        ).twice();
      },
      complete: done
    });
  });
});
