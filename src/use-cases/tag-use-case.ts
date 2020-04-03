import { Observable, of } from "rxjs";
import { TagEndpointOutputMapper, TagEndpointInputMapper, TagEndpointResponse } from "../endpoints/tag-endpoint";
import { CommitExtractor, JiraTicketParser, JiraTicketTagger } from "./github-repository";
import { map, flatMap, mapTo } from "rxjs/operators";

export interface TagUseCase {
    execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>
}

export interface TagUseCaseInput { 
    identifier: string
    tag: string
}
export interface TagUseCaseOutput { }

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
            .pipe(map(x => this.jiraTicketTagger.tag(x, input.tag)))
            .pipe(mapTo(new JiraTagUseCaseOutput()))
    }
}

export class JiraMappers implements TagEndpointOutputMapper, TagEndpointInputMapper {
    map(useCaseOutput: JiraTagUseCaseOutput): TagEndpointResponse {
        return new TagEndpointResponse() 
    }

    mapToUseCase(): TagUseCaseInput {
        return new JiraTagUseCaseInput()
    }
}


class JiraTagUseCaseInput implements TagUseCaseInput {
    identifier: string
    tag: string
}

class JiraTagUseCaseOutput implements TagUseCaseOutput {
}