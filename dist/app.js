"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tag_endpoint_1 = require("./endpoints/tag-endpoint");
const dependencies_1 = require("./endpoints/dependencies");
const app = express_1.default();
const port = 3000;
const dependencies = new dependencies_1.Dependencies();
app.get('/', (req, res) => {
    new tag_endpoint_1.TagEndpoint(dependencies)
        .execute()
        .subscribe(x => res.send(x));
});
app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map