import { GithubSHAFinder } from "../../src/workers/sha-finder";
import { mock, when, instance } from "ts-mockito";
import { GithubService } from "../../src/services/github-service";
import { of, Observable } from "rxjs";

describe('The SHA finder', () => {
    it('calls the github service', (done) => {
        const githubServiceMock = mock<GithubService>()
        when(githubServiceMock.getSHA("owner", "repository", "branchName")).thenReturn(of("sha"))
        const githubService = instance(githubServiceMock);

        const sut = new GithubSHAFinder(githubService, "owner")

        sut.execute("branchName", "repository").subscribe({
            next: (result) =>{
                expect(result).toEqual("sha")
            },
            complete: done
        })
    });
});