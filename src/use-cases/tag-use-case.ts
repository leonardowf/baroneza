import { Observable, of } from "rxjs";
import { TagEndpointOutputMapper, TagEndpointInputMapper, TagEndpointResponse } from "../endpoints/tag-endpoint";

export interface TagUseCase {
    execute(input: TagUseCaseInput): Observable<TagUseCaseOutput>
}

export interface TagUseCaseInput { }
export interface TagUseCaseOutput { }

export class JiraTagUseCase implements TagUseCase {
    execute(identifier: JiraTagUseCaseInput): Observable<JiraTagUseCaseOutput> {
        console.log("very enterprise")
        identifier.greet()
        return of(new JiraTagUseCaseOutput())
    }
}

export class JiraMappers implements TagEndpointOutputMapper, TagEndpointInputMapper {
    map(useCaseOutput: JiraTagUseCaseOutput): TagEndpointResponse {
        return new TagEndpointResponse(useCaseOutput.onlyIHaveThis)
    }

    mapToUseCase(): TagUseCaseInput {
        return new JiraTagUseCaseInput()
    }
}


class JiraTagUseCaseInput implements TagUseCaseInput {

    greet() {
        console.log("bem loko isso")
    }
}

class JiraTagUseCaseOutput implements TagUseCaseOutput {
    onlyIHaveThis: string = "seriao????"
}