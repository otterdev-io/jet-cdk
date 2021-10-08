# Jet CDK

Soar through the Clouds with Jet. Jet CDK is a lightweight toolkit to transform the AWS CDK into a serverless app development environment. This package contains jet, a dev server which provides a live lambda development environment through rapid deploys and near-realtime logging.

# Features:
- Uses CDK Stages to give you configurable and per-developer deployment environments. 
- dev mode, which watches your code and updates your lambdas when they change, while also monitoring your app's logs. This allows for a quick development cycle, while avoiding the troubles that come with attempting to locally emulate an AWS environment. 
- [Afterburner](https://www.npmjs.com/package/@jet-cdk/afterburner), an optional and standalone construct library to simplify API (`API Gateway` and `Appsync`) routing for CDK nodejs. Combined with the Jet runner, turns the CDK into an efficient nodejs serverless app development environment.
- First class support for `Nx`, with `@jet-cdk/jet-nx`.
# Comparison with SST
The 'live cloud development' technique is similar to the style of `SST`, however Jet attempts to take a more minimal approach. Where SST proxyies deployed lambdas to locally running ones, Jet simply watches for source code changes, and redeploys your lambdas using AWS APIs instead of going through a full redploy.
  - [-] There is a small delay to upload updates, and a ~5 delay of relaying to cloudwatch logs. SST provides instant reloads and logging.
  - [-] No debugging support. SST provides local debugging.
  - [+] No extra development infrastructure, as your development deployments are virtually identical to production ones. SST deploys a development stack to support operations.
  - [+] Minimal code changes from raw CDK. Any function construct should be supported, and pure CDK stacks can be used. This should ease interoperability with 3rd party constructs and cdk extensions like pipelines.
     
# Install
Assuming you're in a CDK app:

```sh
npm install @jet-cdk/jet
```

And follow the Setup and Usage instructions.

If you have an Nx workspace, simply:
```sh
npm install -D @jet-cdk/jet-nx
nx g @jet-cdk/jet-nx:jet-cdk-app 
```
To set up a project ready to run, you can skip the rest of the guide. Read the [page for jet-nx](https://www.npmjs.com/package/@jet-cdk/jet-nx) for instructions on usage.
# Setup
In your cdk app main file, create a `JetCore`, and configure it with the stages you want to deploy. The arguments to JetCore are the parent app construct, app id, and an object mapping stage names to the stage definition.

A stage is defined with the function `jetStage`, which takes a function with an argument of the stage itself, and uses it to create a set of stacks, using the stage as a parent.

If a stage has the token `{user}` in the name, the token will be replaced with the `user` attribute from their configuration. When a developer's personal configuration `(.jetrc.json5)` is automatically initialised on first run, it will attempt to set `user` as their user from IAM, falling back or their OS username if that is unavailable. 

The stacks will be listed by the cdk as `app id/stage key/stack id`, and created in cloudformation with a normalised name of `app id-stage key-stack id`.

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
    new FrontendStack(stage, "Frontend"), {
      env: {region: 'ap-southeast-1'}
    }),
});
```

That's it! Any existing lambdas you have in your stacks will be detected automatically, and will be watched for live uploading and logging.

# Verify
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

# Deploy
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

# Exporting deployed properties to a file
The function `outputsFile` in `@jet-cdk/jet/cdk` allows you to define a file which is exported post-deployment, containing the provided contents, in json, json5, or env format. This is useful when locally running applications, eg a frontend, depend on values from your deployed backend. In this case you can export your backend properties to a file loaded by the frontend.

JSON and JSON5 formats allow for contents of any shape and type. ENV format expects a mapping from variable to a string. If no format is specified, JSON is used.

```ts
outputsFile(this, {
  path: path.join(__dirname, "../../frontend/.env.backend.local"),
  contents: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: api.graphqlUrl,
  },
  format: "env",
});

//JSON example
outputsFile(this, {
  path: path.join(__dirname, "../../frontend/.env.backend.local.json"),
  contents: {
    graphqlUrl: api.graphqlUrl,
  }
});
```

# Gitignore
Don't forget to add `.jetrc.json5` and `.jet` to your gitignore.

# Node development
If you are using Node functions, you may want to install `esbuild` in your app's dependencies, otherwise cdk will set up a docker environment to build your functions, which can take some time.

## More documentation to come!
