import { Octokit } from "@octokit/rest";
import bla from "@octokit/rest"
import { mock, instance, when, anything } from "ts-mockito";
import { GithubService } from "../../src/services/github-service";
import { of } from "rxjs";
import { GithubNextReleaseGuesser } from "../../src/workers/next-release-guesser";

describe("the github next release guesser", () => {
    it("fails without semver in the title", (done) => {
        const githubServiceMock = mock<GithubService>()
        const titles: string[] = [
            "title1"
        ]

        when(githubServiceMock.pullRequestTitles(anything(), anything())).thenReturn(of(titles))

        const githubService = instance(githubServiceMock)
        const sut = new GithubNextReleaseGuesser(githubService, "repo", "owner")

        sut.guess().subscribe({
            next: () => {
                fail()
                done()
            },
            error: () => {
                done()
            }
        })
    })

    it("succeeds without semver in the title", (done) => {
        const githubServiceMock = mock<GithubService>()
        const titles: string[] = [
            "bla 1.0.0"
        ]

        when(githubServiceMock.pullRequestTitles(anything(), anything())).thenReturn(of(titles))

        const githubService = instance(githubServiceMock)

        const sut = new GithubNextReleaseGuesser(githubService, "repo", "owner")
        sut.guess().subscribe({
            next: (version) => {
                expect(version).toEqual("1.0.1")
                done()
            },
            error: (error) => {
                fail()
                done()
            }
        })
    })
})