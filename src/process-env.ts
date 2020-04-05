declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test"
            GITHUB_AUTH_TOKEN: string
            JIRA_AUTH_TOKEN: string
            SLACK_AUTH_TOKEN: string
            JIRA_USER_NAME: string
            JIRA_HOST: string
        }
    }
}

export const isProd = () => process.env.NODE_ENV === "production"