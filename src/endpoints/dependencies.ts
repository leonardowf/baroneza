import { TagEndpointDependencies } from "./tag-endpoint";
import { JiraTagUseCase, JiraMappers, JiraTagUseCaseDependencies } from "../use-cases/tag-use-case";
import { GithubPullRequestExtractor, ConcreteJiraTickerParser, ConcreteJiraTickerTagger } from "../use-cases/github-repository";
import { Keychain } from "../keys";
import { Octokit } from "@octokit/rest";

const githubOwner = "PicnicSupermarket"
const githubRepo = "picnic-ios"

export class Dependencies implements TagEndpointDependencies, JiraTagUseCaseDependencies {
    keychain = new Keychain(process.env)

    octokit = () => new Octokit({
        auth: this.keychain.githubAuthToken
    })

    commitExtractor = new GithubPullRequestExtractor(this.octokit(), githubOwner, githubRepo)
    jiraTicketParser = new ConcreteJiraTickerParser()
    jiraTicketTagger = new ConcreteJiraTickerTagger()
    inputMapper = new JiraMappers()
    outputMapper = new JiraMappers()
    tagUseCase = new JiraTagUseCase(this)
}