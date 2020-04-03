"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
class TagEndpoint {
    constructor(dependencies) {
        this.tagUseCase = dependencies.tagUseCase;
        this.inputMapper = dependencies.inputMapper;
        this.outputMapper = dependencies.outputMapper;
    }
    execute() {
        const input = this.inputMapper.mapToUseCase();
        return this.tagUseCase.execute(input).pipe(operators_1.map(x => this.outputMapper.map(x)));
    }
}
exports.TagEndpoint = TagEndpoint;
class TagEndpointResponse {
}
exports.TagEndpointResponse = TagEndpointResponse;
//# sourceMappingURL=tag-endpoint.js.map