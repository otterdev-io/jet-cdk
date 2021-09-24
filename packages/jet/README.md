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
## Bootstrap
- Ensure your app is using new-style synthesis. In cdk.json
```json
"context": {
    "@aws-cdk/core:newStyleStackSynthesis": true
  }
```
- Ensure your AWS profile is [bootstrapped](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html).

## Setup
In your cdk app main file, add a `JetCoreStack`, and configure it with the stages you want to deploy. If a stage has `{user}` in the name, the token will be replaced with the user's name from their configuration, which is initially pulled from IAM, or their os username.

```ts
// bin/my-app.ts

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAppStack } from '../lib/my-app-stack';
import { JetCoreStack, jetStage } from '@jet-cdk/jet/cdk';

const app = new cdk.App();

new JetCoreStack(app, "MyApp", {
  'dev-{user}': jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
  }),
  staging: jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
  }),
  production: jetStage((stage) => {
    new  WebServiceStack(stage, "WebService");
  }, {env: {region: 'ap-southeast-1'}}),
});
```

That's it! Any existing lambdas you have in your stacks will be detected automatically.

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
MyApp/dev-chris/WebServiceStack
MyApp/staging/WebServiceStack
MyApp/production/WebServiceStack
```

## Develop
Start dev mode for a stage:

```sh
npx jet dev dev-chris
```

Jet will perform an initial deploy, and then monitor your code for updates to rapidly update functions. Any logs from your functions will also be emitted.


## Deploy
To deploy all stacks in a stage:

```sh
npx jet deploy production
```

Since it's just a CDK app, you can also deploy stacks individually using cdk:
To deploy all stacks in a stage:

```sh
npx cdk deploy MyApp/production/WebServiceStack
```

# Configuration
Jet will read from two config files, `.jetrc.json5`, for developer-specific configuration, and `jet.config.json5`, for project-wide configuration. Both files can set any configuration value, with `.jetrc.json5` taking precedence. 

If it doesn't exist, `.jetrc.json5` will be created with `user` set to your IAM username, or if that's unreadable, your os username.

You may also pass the `--config` / `-c` flag to provide an alternate project-wide configuration.

The default configuration is:

```js
{
  user: undefined,
  outDir: '.jet,
  dev: {
    stage: undefined,
    watcher: {
      watch: ['lib/**/*'],
      ignore: ['node_modules'],
    },
    synthArgs: ['-q'],
    deployArgs: [],
  },
  deploy: {
    stage: undefined,
    deployArgs: [],
  },
  projectDir: '.',
}
```

The `stage` settings once defined allow you to provide default stages for the `dev` and deploy commands, so that you can just run `jet dev` / `jet deploy` to use the defaults.

# Gitignore
Don't forget to add `.jetrc.json5` and `.jet` to your gitignore.

# More documentation to come!