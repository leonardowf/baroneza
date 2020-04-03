"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_use_case_1 = require("../use-cases/tag-use-case");
const github_repository_1 = require("../use-cases/github-repository");
const githubOwner = "";
const githubRepo = "";
class Dependencies {
    constructor() {
        this.commitExtractor = new github_repository_1.GithubPullRequestExtractor(githubOwner, githubRepo);
        this.jiraTicketParser = new github_repository_1.ConcreteJiraTickerParser();
        this.jiraTicketTagger = new github_repository_1.ConcreteJiraTickerTagger();
        this.inputMapper = new tag_use_case_1.JiraMappers();
        this.outputMapper = new tag_use_case_1.JiraMappers();
        this.tagUseCase = new tag_use_case_1.JiraTagUseCase(this);
    }
}
exports.Dependencies = Dependencies;
//# sourceMappingURL=dependencies.js.map