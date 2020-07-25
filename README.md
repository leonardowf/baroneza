<div align="center">

  **baroneza**
  <br />
  <br />
  **A service to automatically start a release train**
</div>

## ✨ Features
- [x] Sends a message to slack if you want to start the release
- [x] Waits for a reaction
- [x] If you react, the train starts
- [x] Guesses the next release by reading PR history
- [x] Create a pull request from a `base` to a `target`
- [x] Parses Jira tags from commit history of a Pull Request and set the `fix-version` field
- [x] Create automatically the version on Jira

## 🛣 Roadmap
- [ ] Add tests
- [ ] Send message to channel mentioning all Jira issues
- [ ] Tag all pull requests with created release

## 🔨 Getting started
You will need `npm` and then you can do `npm run start:watch`.
To run tests you can use `jest`.
You will also need a `.env` file with the following environment variables:
```
JIRA_AUTH_TOKEN=
JIRA_USER_NAME=
GITHUB_AUTH_TOKEN=
SLACK_AUTH_TOKEN=
```
On slack, the app must be able to read reactions and write messages.
You can configure many options in the `config.json` file.


## 🚀 Deploying
SOON

## 📖 Documentation
The API's that are supported right now:
- POST `createRelease`
```
{
  "branchName": string, // (the name of the branch of your release, e.g. rc-1.0)
  "referenceBranch": string, // (the name of the branch to branch from, e.g. develop)
  "title": string, // (the title of your pull request, e.g. Release Candidate 1.0)
  "targetBranch": string // (the branch that will be used as target, e.g. master)
  "projectTag": string, // (the tag that will be used in jira)
  "repository": string
}
```

- POST `tagPullRequest`
```
{
  "number": int, // (pull request number)
  "identifier": string, // (Jira release identifier)
  "repository": string
}
```

- POST `startTrain`
```
{
  repository: string, // (the repository to create the PR)
  baseBranch: string, // (base branch, for example: develop)
  targetBranch: string, // (base branch, for example: release-candidate)
  channel: string, // (the channel to send the confirmation, if the channel is private, the bot needs to be a member)
}
```
