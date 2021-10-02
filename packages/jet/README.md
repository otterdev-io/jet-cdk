# Jet CDK

Soar through the Clouds with Jet. Jet CDK is a lightweight toolkit for developing serverless apps with the AWS CDK. This package contains jet, a cli tool which provides a live lambda development environment through rapid deploys and logging.

# Features:
- Uses CDK Stages to give you configurable and per-developer deployment environments. 
- dev mode, which watches your code and updates your lambdas when they change, while also monitoring your app's logs. This allows for a quick development cycle, while avoiding the troubles that come with attempting to locally emulate an AWS environment. 
  - This is similar to the approach taken by `SST`, however Jet attempts to be a minimal layer over CDK. It simply deploys your lambdas using AWS apis, rather than proxying to local running ones. 
    - This has a few drawbacks, such as a small delay to upload updates, and a ~5 delay of cloudwatch logs, as well as no debugging support. 
    - However this avoids the need for extra development infrastructure, as your development deployments are virtually identical to production ones, and allows the app to be closer to raw CDK in structure.
- (Soon) `Afterburner`, an optional and standalone construct library to simplify API (`API Gateway` and `Appsync`) routing. I've written it, just need to package it :D
- First class support for `Nx`, with `@jet-cdk/jet-nx`.

# Usage

## Install
```sh
npm install @jet-cdk/jet
```
## Setup
In your cdk app main file, create a `JetCore`, and configure it with the stages you want to deploy. If a stage has `{user}` in the name, the token will be replaced with the user's name from their configuration, which is initially pulled from IAM, or their os username. The stacks will be listed by the cdk as <Core id>/<stage>/<stack id>

```ts
// bin/my-app.ts

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAppStack } from '../lib/my-app-stack';
import { JetCore, jetStage } from '@jet-cdk/jet/cdk';

const app = new cdk.App();

new JetCore(app, "MyApp", {
  'dev-{user}': jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
  }),
  staging: jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
    new FrontendStack(stage, "Frontend")
  }),
  production: jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
    new FrontendStack(stage, "Frontend")
  }, {env: {region: 'ap-southeast-1'}}),
});
```
That's it! Any existing lambdas you have in your stacks will be detected automatically, for live uploading and logging.

## Verify
Verify that the stages are set up properly:

```sh
$ npx jet list-stages

Stages detected from cdk:
dev-chris
staging
production
```

You can see that these are just plain CDK stacks:

```sh
$ npx cdk list
MyApp/dev-chris/WebService
MyApp/staging/WebService
MyApp/production/WebService
```

## Develop
Start dev mode for a stage:

```sh
npx jet dev dev-chris
```

Jet will perform an initial deploy, and then monitor your code for updates to rapidly update functions. Any logs from your functions will also be emitted.

If you want to develop against lambdas only in certain stacks:

```sh
npx jet dev dev-chris --stacks WebService
```

The stacks option can also be placed in `dev.stacks` and `deploy.stacks` in the project configuration to set defaults for development and deployment respectively. Undefined runs all stacks, as does any value being '*'.

## Deploy
To deploy all stacks in a stage:

```sh
npx jet deploy production
```

To deploy to certain stacks within the stage:

```sh
npx jet deploy production --stacks WebService
```

Since it's just a CDK app, you can also deploy stacks using cdk:

```sh
npx cdk deploy MyApp/production/WebService
```

# Configuration
Jet will read from two config files, `.jetrc.json5`, for developer-specific configuration, and `jet.config.json5`, for project-wide configuration. Both files can set any configuration value, with `.jetrc.json5` taking precedence. 

If it doesn't exist, `.jetrc.json5` will be created with `user` set to your IAM username, or if that's unreadable, your OS username.

You may also pass the `--config` / `-c` flag to provide an alternate project-wide configuration.

The default configuration is:

```js
{
  user: undefined,
  outDir: '.jet',
  dev: {
    stage: undefined, //eg. 'dev-{user}'
    stacks: undefined, //eg ['WebService']
    watcher: {
      watch: ['lib/**/*'],
      ignore: ['node_modules'],
    },
    synthArgs: [], //args to pass to 'cdk synth'
    deployArgs: [], //args to pass to 'cdk deploy'
  },
  deploy: {
    stage: undefined, //eg. 'production'
    stacks: undefined, //eg. ['WebService']
    deployArgs: [], //args to pass to 'cdk deploy'
  },
  projectDir: '.', //Base directory of the project. Where config files will be searched from, cdk run from, watcher paths relative to. You probably want to set it via the --project-dir arg instead
}
```

The `stage` and `stacks` settings once defined allow you to provide default stages and stacks for the `dev` and deploy commands, so that you can just run `jet dev` / `jet deploy` to use the defaults.

# Exporting values to a file
A function `writeValues` is provided in `@jet-cdk/jet/cdk` which allows you export a file containing the provided values, in json, json5, or env format. This is useful when locally running applications, eg a frontend, depend on values from your deployed backend. The file is generated after each deployment, so if you just added it, and your jet is running, press d to deploy again.

```ts
writeValues(this, {
  path: path.join(__dirname, "../../frontend/.env.backend.local"),
  values: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: api.graphqlUrl,
  },
  format: "env",
});

//JSON example
writeValues(this, {
  path: path.join(__dirname, "../../frontend/.env.backend.local.json"),
  values: {
    graphqlUrl: api.graphqlUrl,
  }
});
```

# Gitignore
Don't forget to add `.jetrc.json5` and `.jet` to your gitignore.

# Node development
If you are using Node functions, you may want to install `esbuild` in your repo, otherwise cdk will set up a docker environment to build your functions, which can take some time.

# More documentation to come!