import { ConcreteJiraTickerParser } from "../../src/workers/jira-ticket-parser";

describe("The jira ticket parser", () => {
    var sut: ConcreteJiraTickerParser
    beforeEach(() => {
        sut = new ConcreteJiraTickerParser()
    })

    it("works with number tags", () => {
        expect(sut.parse(["[PSF-123] Bla Bla"])).toStrictEqual(["PSF-123"])
    })

    it("does not work with number tags", () => {
        expect(sut.parse(["[PSF-abc] Bla Bla"])).toStrictEqual([])
    })


})