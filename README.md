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

## 🏗 Architecture
The idea is to keep it simple with no hard abstractions, but also maintaining flexibility to increase LOC covered.
The main components are: Endpoints, UseCases, Workers and Services.

### Endpoints
Endpoints are the entry of every request. They exist to keep documented all the supported APIs. They should map 1:1 to a UseCase.

### UseCases
UseCases perform the logic of the application. They can have other UseCases as dependencies and also many Workers.

### Workers
Workers do only one thing. They can have Services as dependencies.

### Services
Services make the bridge of baroneza and external APIs.

### Should I create a Worker or a UseCase?
There is no silver bullet and don't waste too much brainpower on this. The rule of thumb used is:
- If the problem that you are trying to solve requires an AND, then go with a UseCase.
- If you can think of your problem as one single atomic responsibility, go with a Worker.
Example: To create a release, we need to create a branch and create the pr and parse the commits and ... The amount of different things that need to be done fit an use case. Now, parsing and creating a branch, sound like an atomic operation that don't care about previous steps, they fit as a worker.

