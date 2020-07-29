import { GithubReleasePageCreator } from "../../src/workers/release-page-creator";
import { mock, instance, when } from "ts-mockito";
import { GithubService } from "../../src/services/github-service";
import { of } from "rxjs";

describe('the release page creator', () => {
    it('calls the github service', (done) => {
        const githubServiceMock = mock<GithubService>()
        
        when(githubServiceMock.createPreRelease("tag", "name", "owner", "repo", "body")).thenReturn(of(void 0))
        const githubService = instance(githubServiceMock)
        const sut = new GithubReleasePageCreator(githubService, "owner")

        sut.create("tag", "name", "repo", "body").subscribe({
            complete: done
        })
    });
});