import { of } from "rxjs";
import { verify, anything, instance, mock, when } from "ts-mockito";
import { GithubService } from "../../src/services/github-service";
import { GithubMilestoneCreator } from "../../src/workers/milestone-creator";

describe('the milestone creator', () => {
    it('creates a new milestone if none found', (done) => {
        // consts
        const owner = 'owner'
        const repository = 'repository'
        const title = 'title'
        const milestoneId = 123

        // mocks
        const githubServiceMock = mock<GithubService>();
        
        // when mocks
        when(githubServiceMock.getMilestone(owner, repository, title)).thenReturn(of(undefined))
        when(githubServiceMock.createMilestone(owner, repository, title)).thenReturn(of(milestoneId))

        // instances
        const githubService = instance(githubServiceMock);

        const sut = new GithubMilestoneCreator(githubService, owner);

        sut.create(title, repository).subscribe({
            next: (result) => {
                expect(result).toEqual(milestoneId)
            },
            complete: done
        })
    });

    it('creates a new milestone if none found', (done) => {
        // consts
        const owner = 'owner'
        const repository = 'repository'
        const title = 'title'
        const foundMilestoneId = 456

        // mocks
        const githubServiceMock = mock<GithubService>();
        
        // when mocks
        when(githubServiceMock.getMilestone(owner, repository, title)).thenReturn(of(foundMilestoneId))

        // instances
        const githubService = instance(githubServiceMock);

        const sut = new GithubMilestoneCreator(githubService, owner);

        sut.create(title, repository).subscribe({
            next: (result) => {
                verify(githubServiceMock.createMilestone(anything(), anything(), anything())).never()
                expect(result).toEqual(foundMilestoneId)
            },
            complete: done
        })
    });
});