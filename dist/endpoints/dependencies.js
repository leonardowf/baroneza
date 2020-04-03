"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_use_case_1 = require("../use-cases/tag-use-case");
class Dependencies {
    constructor() {
        this.inputMapper = new tag_use_case_1.JiraMappers();
        this.outputMapper = new tag_use_case_1.JiraMappers();
        this.tagUseCase = new tag_use_case_1.JiraTagUseCase();
    }
}
exports.Dependencies = Dependencies;
//# sourceMappingURL=dependencies.js.map