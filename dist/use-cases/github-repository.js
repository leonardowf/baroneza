"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class GithubPullRequestExtractor {
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }
    commits(identifier) {
        return rxjs_1.of(["oi"]);
    }
}
exports.GithubPullRequestExtractor = GithubPullRequestExtractor;
class ConcreteJiraTickerParser {
    parse(values) {
        return ["[PSF-1234]"];
    }
}
exports.ConcreteJiraTickerParser = ConcreteJiraTickerParser;
class ConcreteJiraTickerTagger {
    tag(ticketIds, tag) {
        console.log(ticketIds);
        return rxjs_1.of(new ConcreteJiraTicket());
    }
}
exports.ConcreteJiraTickerTagger = ConcreteJiraTickerTagger;
class ConcreteJiraTicket {
}
exports.ConcreteJiraTicket = ConcreteJiraTicket;
//# sourceMappingURL=github-repository.js.map