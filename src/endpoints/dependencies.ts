import { TagEndpointDependencies } from "./tag-endpoint";
import { JiraTagUseCase, JiraMappers, JiraTagUseCaseDependencies } from "../use-cases/tag-use-case";
import { GithubPullRequestExtractor, ConcreteJiraTickerParser, ConcreteJiraTickerTagger } from "../use-cases/github-repository";

const githubOwner = ""
const githubRepo = ""

export class Dependencies implements TagEndpointDependencies, JiraTagUseCaseDependencies {
    commitExtractor = new GithubPullRequestExtractor(githubOwner, githubRepo)
    jiraTicketParser = new ConcreteJiraTickerParser()
    jiraTicketTagger = new ConcreteJiraTickerTagger()
    inputMapper = new JiraMappers()
    outputMapper = new JiraMappers()
    tagUseCase = new JiraTagUseCase(this)
}