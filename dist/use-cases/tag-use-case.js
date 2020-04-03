"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_endpoint_1 = require("../endpoints/tag-endpoint");
const operators_1 = require("rxjs/operators");
class JiraTagUseCase {
    constructor(dependencies) {
        this.commitExtractor = dependencies.commitExtractor;
        this.jiraTickerParser = dependencies.jiraTicketParser;
        this.jiraTicketTagger = dependencies.jiraTicketTagger;
    }
    execute(input) {
        return this.commitExtractor
            .commits(input.identifier)
            .pipe(operators_1.map(x => this.jiraTickerParser.parse(x)))
            .pipe(operators_1.map(x => this.jiraTicketTagger.tag(x, input.tag)))
            .pipe(operators_1.mapTo(new JiraTagUseCaseOutput()));
    }
}
exports.JiraTagUseCase = JiraTagUseCase;
class JiraMappers {
    map(useCaseOutput) {
        return new tag_endpoint_1.TagEndpointResponse();
    }
    mapToUseCase() {
        return new JiraTagUseCaseInput();
    }
}
exports.JiraMappers = JiraMappers;
class JiraTagUseCaseInput {
}
class JiraTagUseCaseOutput {
}
//# sourceMappingURL=tag-use-case.js.map