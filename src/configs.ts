import dotenv from "dotenv";
import { isProd } from "./process-env";

export class Config {
    githubRepo: string
    githubOwner: string
    jiraHost: string

    constructor(processEnv: NodeJS.ProcessEnv) {
        if (!isProd()) {
            dotenv.config()
        }

        this.jiraHost = processEnv.JIRA_HOST
        this.githubOwner = processEnv.GITHUB_OWNER
        this.githubRepo = processEnv.GITHUB_REPO
    }
}