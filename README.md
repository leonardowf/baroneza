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
- [x] Guesses the next release by reading the PR history
- [x] Creates a pull request from a `base` to a `target`
- [x] Creates the fix-version on Jira
- [x] Parses Jira tags from commit history of a Pull Request and set the `fix-version` field
- [x] Creates Changelogs based on the KeepAChangelogFormat
- [x] Creates a Github draft release with the Changelog

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
You can check the supported endpoints in the swagger page: `localhost:3000/swagger`
