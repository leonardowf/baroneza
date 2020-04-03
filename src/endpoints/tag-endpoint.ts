import { MonoTypeOperatorFunction, of, Observable } from "rxjs";
import { single, map } from "rxjs/operators";
import { TagUseCase, TagUseCaseInput, TagUseCaseOutput } from "../use-cases/tag-use-case";

export interface TagEndpointDependencies {
    tagUseCase: TagUseCase
    inputMapper: TagEndpointInputMapper
    outputMapper: TagEndpointOutputMapper
}

export interface TagEndpointInputMapper {
    mapToUseCase(): TagUseCaseInput
}

export interface TagEndpointOutputMapper {
    map(useCaseOutput: TagUseCaseOutput): TagEndpointResponse
}

export class TagEndpoint {
    tagUseCase: TagUseCase
    inputMapper: TagEndpointInputMapper
    outputMapper: TagEndpointOutputMapper

    constructor(dependencies: TagEndpointDependencies) {
        this.tagUseCase = dependencies.tagUseCase
        this.inputMapper = dependencies.inputMapper
        this.outputMapper = dependencies.outputMapper
    }

    execute(): Observable<TagEndpointResponse> {
        const input = this.inputMapper.mapToUseCase()
        return this.tagUseCase.execute(input).pipe(map(x => this.outputMapper.map(x)))
    }
}

export class TagEndpointResponse {
}