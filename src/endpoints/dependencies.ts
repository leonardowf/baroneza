import { TagEndpointDependencies } from "./tag-endpoint";
import { JiraTagUseCase, JiraMappers } from "../use-cases/tag-use-case";

export class Dependencies implements TagEndpointDependencies {
    inputMapper = new JiraMappers()
    outputMapper = new JiraMappers()
    tagUseCase = new JiraTagUseCase()
}