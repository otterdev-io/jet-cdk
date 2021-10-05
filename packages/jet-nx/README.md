# jet-nx

Nx support for `@jet-cdk/jet`

# Usage

## Install
```sh
npm install -D @jet-cdk/jet-nx
```

## Generate 
To generate a new app using jet:

``` sh
nx g @jet-cdk/jet-nx:jet-cdk-app
```

To add jet tasks and a basic ts-focused config file to your existing cdk app:

``` sh
nx g @jet-cdk/jet-nx:add-to-cdk-app
```

It is recommended to set some default stages in the jet config file to avoid having to pass them in repeatedly.

## List stages
After generating to list stages:

``` sh
nx list-stages my-app
```

## Develop
To enter the development workflow:
``` sh
nx dev my-app --stage=dev-chris
```

You may also add varying configurations to your workspace.json, running against different stages and stacks


## Deploy
``` sh
nx deploy my-app --stage=production
```

The original cdk `deploy` target is renamed to `cdk-deploy`.