# afterburner

Afterburner provides an elegant, powerful set of functional apis for building serverless apps with the AWS CDK, with a focus on streamlining lambda function usage. The apis are based around function composition, allowing you to mix and match the pieces in the way that you need, without losing any power or access to the properties you need.

It currently provides apis for:
	- Setting up routing for API Gateway V2
	- Setting up resolvers for Appsync.
  - Setting up lambda triggers on Cognito 

Here's a sample of the the API Gateway API:

```ts
      //Use provided tags to get going quickly, or construct your own
      '/my': { 
        GET: node`lib/my-node-function.ts`,
        //All languages with CDK constructs, have provided helpers: node (typescript included), python and go
        POST: go`lib/go-function.ts`,
      },
      '/yours': { 
        //You can build your functions as you go
        GET: lambda(go('lib/your-node-function.go')),
        //Specify any of the construct's supported properties when you need more control
        PUT: lambda(go({handler: 'lib/go-function.go', entry: 'doPut'}))
      },
      '/my/proxy': { 
        // All integrations are supported
        GET: httpProxy({url: 'https://myproxy.com'}),
      },
      '/secure': {
        //Authorizers supported. They just compose over integrations.
        GET: userPool({userPoolClient: myClient, userPool: myPool}, myScopes)(
          node`lib/my-secure-api.ts`
        ),
        // You can provide your own handler. It's functions all the way own
        POST: (scope, id)=>({integration: new MyIntegration(scope, id)})
      }
```

It is part of the Jet-CDK project, a toolkit to simplify serverless app development.
Although it pairs well with the Jet live environment, Afterburner can be used standalone.

# API Gateway
The routing api allows you to reate mappings from paths, to methods, to a handler.
If you find you are using a certain configuration of lambda handler commonly, you can turn it into a tag with `tagOf`, allowing you to keep your routing syntax clean.

## Quick start
Be sure to install:
- @aws-cdk/aws-apigatewayv2
- @aws-cdk/aws-apigatewayv2-integrations
- @aws-cdk/aws-apigatewayv2-authorizers
- Any lambda handler packages, eg @aws-cdk/aws-lambda-nodejs

A minimal rest API :

```ts
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { route } from '@jet-cdk/afterburner/apigatewayv2';
import nodejs from '@jet-cdk/afterburner/apigatewayv2/prefab-tags/nodejs';

const api = new HttpApi(this, 'api');
const routes = route(api, {
  '/my': { 
    GET: nodejs`lib/get-function.ts`,
    POST: nodejs`lib/post-function.ts` 
  },
  '/another-place': { 
    ANY: nodejs`lib/get-node-function.ts`,
  }
}
```

The CDK nodejs handler defaults are intact, that means an export called `handler` is used from each function file

## More options
To specify a handler with your own settings add a couple of imports:

```ts
import lambda from '@jet-cdk/afterburner/apigatewayv2/integrations/lambda-proxy';
import nodeFn from '@jet-cdk/afterburner/functions/nodejs';
```

Now you can provide handlers with any configuration:
```ts

'/my': { 
  POST: lambda(nodeFn({
    entry: 'lib/post-function.ts',
    handler: 'handlePost',
    runtime: Runtime.NODEJS_12_X
  })
}

```

If you find that use a certain configuration repeatedly, you can turn it into a template tag:

```ts
import { route } from '@jet-cdk/afterburner/apigatewayv2';
import lambda from '@jet-cdk/afterburner/apigatewayv2/integrations/lambda-proxy';
import nodeFn from '@jet-cdk/afterburner/functions/nodejs';
import { tagOf } from '@jet-cdk/afterburner/lib';

const node12 = tagOf((filename) => lambda(nodeFn({
  entry: filename,
  runtime: Runtime.NODEJS_12_X
})

route(api, {
  '/my': { 
    POST: node12`/lib/my-node12-handler.ts`
  }
})

```

## Accessing the functions
After creation, handlers are accesible by their mapping.

```ts
const routes = route(api, {
  '/my': { 
    GET: nodejs`lib/get-function.ts`,
    POST: nodejs`lib/post-function.ts` 
  },
  '/another-place': { 
    ANY: nodejs`lib/get-node-function.ts`,
  }
}

table.grantReadWriteData(
  routes['/my'].POST.integration.handler.grantPrincipal
)
```

# Other integrations
You will find all integrations and authorizers are supported:

```ts

import httpProxy from '@jet-cdk/afterburner/apigatewayv2/integrations/http-proxy';

GET: httpProxy({url: 'https://myproxy.com'}),
```

```ts
import userPool from '@jet-cdk/afterburner/apigatewayv2/authorizers/user-pool';

GET: userPool({userPoolClient: myClient, userPool: myPool})(
  node`lib/my-secure-api.ts`
)
```

## Full example
Here's an example of other ways to use the api

```ts

import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { route } from '@jet-cdk/afterburner/apigatewayv2';
import lambda from '@jet-cdk/afterburner/apigatewayv2/integrations/lambda-proxy';
import httpProxy from '@jet-cdk/afterburner/apigatewayv2/integrations/http-proxy';
import userPool from '@jet-cdk/afterburner/apigatewayv2/authorizers/user-pool';
import nodejs from '@jet-cdk/afterburner/apigatewayv2/prefab-tags/nodejs';
import go from '@jet-cdk/afterburner/functions/go';
import nodeFn from '@jet-cdk/afterburner/functions/nodejs';
import compose from 'compose-function';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    //Set up tags for common lambda handlers
    const node = tagOf(filename=>lambda(nodejs(filename)))
    //Use compose for a touch of elegance
    const goFn = tagOf(compose(lambda, go))

    //All properties are available
    const dynanode = tagOf(filename=>lambda(nodejs({
      entry: s, 
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: 'my_table'}
      }
    )))

    const api = new HttpApi(this, 'api');

    const routes = route(api, {
      //Use a tag
      '/my': { 
        GET: node`lib/my-node-function.ts`,
        POST: dynanode`lib/my-node-function.ts` 
      },
      '/yours': { 
        //All built in languages are supported
        POST: goFn`lib/go-function.ts`,
        //Build your functions as you go
        GET: lambda(go('lib/your-node-function.go')),
        //Specify properties inline
        PUT: lambda(go({handler: 'lib/go-function.go', entry: 'doPut'}))
      },
      '/my/proxy': { 
        // All integrations are supported
        GET: httpProxy({url: 'https://myproxy.com'}),
        // You can provide your own handler. Its functions all the way own
        POST: (scope, id)=>({integration: new MyIntegration(scope, id)})
      },
      '/secure': {
        GET: userPool({userPoolClient: myClient, userPool: myPool})(
          node`lib/my-secure-api.ts`
        )
      }
    });

    //After creation, handlers are accesible by their mapping
    table.grantReadWriteData(
      routes['/my'].POST.integration.handler.grantPrincipal
    )


    new CfnOutput(this, 'apiUrl', { value: api.url ?? '' });
  }
}
```

# Appsync
## Quick start
Make sure to install:
Be sure to install:
- @aws-cdk/aws-appsyc
- Any lambda handler packages, eg @aws-cdk/aws-lambda-nodejs

The appsync api is very similar to the api gateway one:


```ts
import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { setupResolvers } from '@jet-cdk/afterburner/appsync';
import nodejs from '@jet-cdk/afterburner/appsync/prefab-tags/nodejs';

const api = new GraphQLApi(this, 'api', {name: 'My Api'});
const dataSources = setupResolvers(api, {
      Query: {
        myQuery: nodejs`lib/my-query.ts`,
      },
      Mutation: {
        doSomething: nodejs`lib/do-something.ts`,
      }
    });
```

```ts
import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import { CfnOutput } from '@aws-cdk/core';
import { setupResolvers } from '@jet-cdk/afterburner/appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import node from '@jet-cdk/afterburner/appsync/prefab-tags/nodejs';
import lambda from '@jet-cdk/afterburner/appsync/datasources/lambda';
import dynamoDS from '@jet-cdk/afterburner/appsync/datasources/dynamo';
import nodejs from '@jet-cdk/afterburner/functions/nodejs';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

    const api = new appsync.GraphqlApi(this, 'api', { name: 'app' });

    const dataSources = setupResolvers(api, {
      resolvers: {
        Query: {
          myQuery: node`lib/myQuery.ts`,
          putItem: resolver(lambda(nodejs('lib/putItem.ts'))),
          editTable: resolver(dynamoDS(table), {
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
              appsync.PrimaryKey.partition('id').auto(),
              appsync.Values.projecting('input')
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
          }),
        },
        Mutation: {
          doTheThing: lambda(nodejs({entry: 'lib/myQuery.ts', handler: 'doTheThing'})),
        }
      },
    });

    table.grantReadWriteData(dataSources.Query.putItem.lambdaFunction.grantPrincipal);

    new CfnOutput(this, 'apiUrl', { value: api.graphqlUrl ?? '' });
  }
}
```

# Cognito
Cognito accepts functions directly, therefore no prefabbed template tags are provided. Simply use the language functions around a string for a simple handler.

```ts
import { addTriggers } from "@jet-cdk/afterburner/cognito";
import nodejs from "@jet-cdk/afterburner/functions/nodejs";

const triggerFns = addTriggers(userPool, {
  triggers: {
    customMessage: nodejs("handlers/user/customMessage.ts")
    postConfirmation: nodejs({
      entry: "handlers/user/postConfirmation.ts",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    }),
  },
});

userTable.grantFullAccess(triggerFns.postConfirmation);
```