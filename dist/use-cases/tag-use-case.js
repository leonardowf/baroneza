"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const tag_endpoint_1 = require("../endpoints/tag-endpoint");
class JiraTagUseCase {
    execute(identifier) {
        console.log("very enterprise");
        identifier.greet();
        return rxjs_1.of(new JiraTagUseCaseOutput());
    }
}
exports.JiraTagUseCase = JiraTagUseCase;
class JiraMappers {
    map(useCaseOutput) {
        return new tag_endpoint_1.TagEndpointResponse(useCaseOutput.onlyIHaveThis);
    }
    mapToUseCase() {
        return new JiraTagUseCaseInput();
    }
}
exports.JiraMappers = JiraMappers;
class JiraTagUseCaseInput {
    greet() {
        console.log("bem loko isso");
    }
}
class JiraTagUseCaseOutput {
    constructor() {
        this.onlyIHaveThis = "seriao????";
    }
}
//# sourceMappingURL=tag-use-case.js.map