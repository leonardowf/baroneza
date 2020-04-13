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

## 🛣 Roadmap
- [ ] Create automatically the version on Jira
- [ ] Add tests
- [ ] Send message to channel mentioning all Jira issues
- [ ] Tag all pull requests with created release

## 🔨 Getting started
You will need `npm` and then you can do `npm run start:watch`.
You will also need a `.env` file with the following environment variables:
```
JIRA_AUTH_TOKEN=
JIRA_USER_NAME=
GITHUB_AUTH_TOKEN=
SLACK_AUTH_TOKEN=
```
You can configure many options in the `config.json` file.


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
  "projectTag": string (the tag that will be used in jira)
}
```

- POST `tagPullRequest`
```
{
  "number": int, (pull request number)
  "identifier": string (Jira release identifier)
}
```

- POST `startTrain`
```
{
}
```
