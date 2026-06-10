# StackAI Staffbase Custom Widget

This repository contains the source code for the MCH Group Staffbase widget.

When GitHub Pages is enabled for this public repository, the deployment workflow publishes the production bundle from `dist/`.

Hosted bundle URL:

```text
https://falak-staffbase.github.io/stackai-staffbase-widget/mch-group.my-test.js
```

## Installation

```bash
$ npm install
```

## Running the app

| Command | Description |
|---|---|
| `npm start` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm run build:watch` | Creates the production build and watch for changes |
| `npm run test` | Runs the unit tests |
| `npm run test:watch` | Runs the unit tests and watches for changes |
| `npm run type-check` | Checks the codebase on type errors |
| `npm run type-check:watch` | Checks the codebase on type errors and watches for changes |
| `npm run lint` | Checks the codebase on style issues |
| `npm run lint:fix` | Fixes style issues in the codebase |


## Building the form for configuration

This project uses [react-jsonschema-form](https://rjsf-team.github.io/react-jsonschema-form/) for configuring the widget properties. For more information consult their [documentation](https://rjsf-team.github.io/react-jsonschema-form/docs/) 

## Deployment

Pushes to `master` trigger `.github/workflows/deploy-pages.yml`, which:

```text
1. installs dependencies
2. builds the widget bundle into dist/
3. publishes dist/ to GitHub Pages
```

The repository must be public, and GitHub Pages must be enabled in the repository settings.

