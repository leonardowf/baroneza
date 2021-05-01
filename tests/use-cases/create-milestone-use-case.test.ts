import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { GithubService } from '../../src/services/github-service';
import {
  CreateMilestoneUseCaseInput,
  GithubCreateMilestoneUseCase
} from '../../src/use-cases/create-milestone-use-case';
import { MilestoneCreator } from '../../src/workers/milestone-creator';
import { PullRequestNumberExtractor } from '../../src/workers/pr-number-extractor';

describe('the create milestone use case', () => {
  it('executes correcty', (done) => {
    // constants
    const owner = 'owner';
    const pullNumber = 123;
    const repository = 'repository';
    const title = 'title';
    const extractedPullNumbers = [45, 67];
    const milestoneId = 898989;

    // mocks
    const pullRequestNumberExtractorMock = mock<PullRequestNumberExtractor>();
    const milestoneCreatorMock = mock<MilestoneCreator>();
    const githubServiceMock = mock<GithubService>();

    // when mocks
    when(
      pullRequestNumberExtractorMock.extract(pullNumber, repository)
    ).thenReturn(of(extractedPullNumbers));
    when(milestoneCreatorMock.create(title, repository)).thenReturn(
      of(milestoneId)
    );
    when(
      githubServiceMock.setMilestoneToPR(
        owner,
        repository,
        milestoneId,
        extractedPullNumbers[0]
      )
    ).thenReturn(of(void 0));
    when(
      githubServiceMock.setMilestoneToPR(
        owner,
        repository,
        milestoneId,
        extractedPullNumbers[1]
      )
    ).thenReturn(of(void 0));

    // instances
    const pullRequestNumberExtractor = instance(pullRequestNumberExtractorMock);
    const milestoneCreator = instance(milestoneCreatorMock);
    const githubService = instance(githubServiceMock);

    const sut = new GithubCreateMilestoneUseCase(
      owner,
      pullRequestNumberExtractor,
      milestoneCreator,
      githubService
    );

    sut
      .execute(
        new CreateMilestoneUseCaseInput(
          pullNumber,
          repository,
          title,
        )
      )
      .subscribe({
        complete: done
      });
  });
});
