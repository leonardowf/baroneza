import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';

export class GithubServiceMock {
  readonly owner: string;
  readonly repo: string;
  readonly githubService: GithubService;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
    this.githubService = mock<GithubService>();
  }

  build(): GithubService {
    return instance(this.githubService);
  }

  unmergeablePR(pullNumber: number): GithubServiceMock {
    when(
      this.githubService.pullRequestData(this.owner, this.repo, pullNumber)
    ).thenReturn(
      of({
        number: 123,
        login: 'login',
        description: 'description',
        mergedAt: '2021-02-01',
        url: 'www.pudim.com.br',
        authorImageUrl: 'www.image.com',
        mergeable: false
      })
    );

    return this;
  }

  mergeablePR(pullNumber: number): GithubServiceMock {
    when(
      this.githubService.pullRequestData(this.owner, this.repo, pullNumber)
    ).thenReturn(
      of({
        number: 123,
        login: 'login',
        description: 'description',
        mergedAt: '2021-02-01',
        url: 'www.pudim.com.br',
        authorImageUrl: 'www.image.com',
        mergeable: true
      })
    );

    return this;
  }

  mergeFailed(pullNumber: number): GithubServiceMock {
    when(
      this.githubService.merge(this.owner, this.repo, pullNumber)
    ).thenReturn(of({ merged: false }));
    return this;
  }

  mergeSucceeded(pullNumber: number): GithubServiceMock {
    when(
      this.githubService.merge(this.owner, this.repo, pullNumber)
    ).thenReturn(of({ merged: true }));
    return this;
  }

  compareAheadBy(
    head: string,
    base: string,
    aheadBy: number
  ): GithubServiceMock {
    when(
      this.githubService.compareCommits(this.owner, this.repo, head, base)
    ).thenReturn(of({ aheadBy }));
    return this;
  }
}
