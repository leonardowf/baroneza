import dotenv from "dotenv";

export class Keychain {
    githubAuthToken: string
    jiraAuthToken: string
    slackAuthToken: string

    constructor(processEnv: NodeJS.ProcessEnv) {
        if (!isProd()) {
            dotenv.config()
        }

        this.githubAuthToken = processEnv.GITHUB_AUTH_TOKEN
        this.jiraAuthToken = processEnv.JIRA_AUTH_TOKEN
        this.slackAuthToken = processEnv.SLACK_AUTH_TOKEN
    }
}

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test"
            GITHUB_AUTH_TOKEN: string
            JIRA_AUTH_TOKEN: string
            SLACK_AUTH_TOKEN: string
        }
    }
}

const isProd = () => process.env.NODE_ENV === "production"
