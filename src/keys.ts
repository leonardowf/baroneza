import dotenv from "dotenv";
import { isProd } from "./process-env";

export class Keychain {
    githubAuthToken: string
    jiraAuthToken: string
    jiraUserName: string
    slackAuthToken: string

    constructor(processEnv: NodeJS.ProcessEnv) {
        if (!isProd()) {
            dotenv.config()
        }

        this.githubAuthToken = processEnv.GITHUB_AUTH_TOKEN
        this.jiraAuthToken = processEnv.JIRA_AUTH_TOKEN
        this.slackAuthToken = processEnv.SLACK_AUTH_TOKEN
        this.jiraUserName = processEnv.JIRA_USER_NAME
    }
}