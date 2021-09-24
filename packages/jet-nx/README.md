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

To add jet tasks and a basic ts-focused config file to your existin cdk app:

``` sh
nx g @jet-cdk/jet-nx:add-to-cdk-app
```

It is recommended to set some default stages in the jet config file to avoid having to pass them in repeatedly.

## Execute
After generating:

``` sh
nx list-stages my-app
```

``` sh
nx dev my-app --stage=dev-chris
```

``` sh
nx deploy my-app --stage=production
```
