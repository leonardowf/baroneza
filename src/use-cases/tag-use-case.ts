import { Observable, of } from "rxjs";
import { TagEndpointOutputMapper, TagEndpointInputMapper, TagEndpointResponse, TagEndpointInput } from "../endpoints/tag-endpoint";
import { CommitExtractor, JiraTicketParser } from "../repositories/github-repository";
import { map, mapTo, flatMap } from "rxjs/operators";
import { JiraTicketTagger } from "../repositories/jira-tagger";

export interface TagUseCase {
    execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>
}

export interface TagUseCaseInput { 
    identifier: number
    tag: string
}
export interface TagUseCaseOutput { 
    successes: string[]
    failures: string[]
}

export interface JiraTagUseCaseDependencies {
    commitExtractor: CommitExtractor
    jiraTicketParser: JiraTicketParser
    jiraTicketTagger: JiraTicketTagger
}

export class JiraTagUseCase implements TagUseCase {
    commitExtractor: CommitExtractor
    jiraTickerParser: JiraTicketParser
    jiraTicketTagger: JiraTicketTagger

    constructor(dependencies: JiraTagUseCaseDependencies) {
        this.commitExtractor = dependencies.commitExtractor
        this.jiraTickerParser = dependencies.jiraTicketParser
        this.jiraTicketTagger = dependencies.jiraTicketTagger
    }

    execute(input: JiraTagUseCaseInput): Observable<JiraTagUseCaseOutput> {
        return this.commitExtractor
            .commits(input.identifier)
            .pipe(map(x => this.jiraTickerParser.parse(x)))
            .pipe(flatMap(x => this.jiraTicketTagger.tag(x, input.tag)))
            .pipe(map(x => new JiraTagUseCaseOutput(x.successes, x.failures)))
    }
}

export class JiraMappers implements TagEndpointOutputMapper, TagEndpointInputMapper {
    map(useCaseOutput: JiraTagUseCaseOutput): TagEndpointResponse {

        return new TagEndpointResponse(useCaseOutput.successes, useCaseOutput.failures)
    }

    mapToUseCase(tagEndpointInput: TagEndpointInput): TagUseCaseInput {
        return new JiraTagUseCaseInput(tagEndpointInput.number, tagEndpointInput.tag)
    }
}


class JiraTagUseCaseInput implements TagUseCaseInput {
    identifier: number
    tag: string

    constructor(identifier: number, tag: string) {
        this.identifier = identifier
        this.tag = tag
    }
}

class JiraTagUseCaseOutput implements TagUseCaseOutput {
    successes: string[]
    failures: string[]

    constructor(successes: string[], failures: string[]) {
        this.successes = successes
        this.failures = failures
    }
}