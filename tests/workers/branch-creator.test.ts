import { GithubService } from "../../src/services/github-service";
import { mock, instance, when } from "ts-mockito";
import { GithubBranchCreator } from "../../src/workers/branch-creator";
import { of } from "rxjs";

describe("The github branch creator", () => {
    it("calls the github service", (done) => {
        const githubServiceMock = mock<GithubService>()

        when(githubServiceMock.createBranch("owner", "sha", "branchName", "repository")).thenReturn(of(void 0))

        const githubService = instance(githubServiceMock)
        const sut = new GithubBranchCreator(githubService, "owner")

        sut.create("sha", "branchName", "repository").subscribe({
            next: () => {
                done()
            }
        })
    })
})