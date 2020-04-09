<div align="center">

  **baroneza**
  <br />
  <br />
  **A service to automatically start a release train**
</div>

## ✨ Features
- [x] Extract Jira tags from commit history of a Pull Request and set the `fix-version` field
- [x] Create a pull request from a `base` to a `target` and tag the commit history in Jira

## 🛣 Roadmap
- [ ] Send a message on slack and wait for some reaction to start the release
- [ ] Create a release on Github with all the pull requests
- [ ] Send a message on Slack with all the issues included in the release
- [ ] Automatically send a message on Slack asking if the release can start


## 🔨 Getting started
You will need `npm` and then you can do `npm run start:watch`.
You will also need a `.env` file with the following environment variables:
- `GITHUB_AUTH_TOKEN`
- `JIRA_AUTH_TOKEN`
- `SLACK_AUTH_TOKEN`
- `JIRA_USER_NAME`
- `JIRA_HOST`

And some configuration values such as:
- `JIRA_HOST`
- `GITHUB_OWNER`
- `GITHUB_REPO`


## 🚀 Deploying
SOON

## 📖 Documentation
The API's that are supported right now:
- POST `createRelease`
```
{
  "branchName": string, (the name of the branch of your release, e.g. rc-1.0)
  "referenceBranch": string, (the name of the branch to branch from, e.g. develop)
  "title": string, (the title of your pull request, e.g. Release Candidate 1.0)
  "targetBranch": string (the branch that will be used as target, e.g. master)
}
```

- POST `tagPullRequest`
```
{
  "number": int, (pull request number)
  "identifier": string (Jira release identifier)
}
```
