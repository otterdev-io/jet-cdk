# afterburner

Afterburner is a set of functions that provide elegant, yet powerful apis for building a serverless app with the AWS CDK, with a focus on streamlining lambda function integration. The apis are based around function composition, allowing for declarative routing with full power.

It is part of Jet-CDK, a toolkit to simplify serverless app development.
Despite this, although it pairs well with the Jet environment, with its live lambda reloading, Afterburner can be used standalone.

It currently provides:
	- an api to setup routing for API Gateway V2
	- an api to setup resolves for Appsync.

More documentation to come!
# API Gateway examples

```ts

import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { route } from '@jet-cdk/afterburner/apigatewayv2';
import lambda from '@jet-cdk/afterburner/apigatewayv2/integrations/lambda-proxy';
import nodejs from '@jet-cdk/afterburner/functions/nodejs';
import go from '@jet-cdk/afterburner/fn/go';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const api = new HttpApi(this, 'api');

    route(api, {
      routes: {
        '/my': { GET: 'lib/my-node-function.ts' },
        '/yours': { 
          GET: lambda(go('lib/your-node-function.go')),
          POST: 'lib/go-function.ts',
          PUT: lambda(go({handler: 'lib/go-function.go', entry: 'doPut'}))
        },
      },
      defaultOptions: (s) => lambda(nodejs(s)),
      // using 'compose-function':
      // defaultOptions: compose(lambda, nodejs),
    });

    new CfnOutput(this, 'apiUrl', { value: api.url ?? '' });
  }
}
```

We see that the main function for API Gateway is the `route` function. You provide a map of routes, to methods, then finally to the route options. If simply a file path is path is provided as the options, the `defaultOptions` function is consulted to get the builder to use
A variety of formats are supported for the route options builder The following are all valid builders:
- A string, using `defaultOptions`: `'lib/my-node-function.ts'`
- A builder function
  - eg just an integration: `lambda(nodejs('lib/my-node-function.ts'))`
  - eg with an authorizer: `userPool({userPoolClient, userPool}, [], lambda(nodejs('lib/my-node-function.ts')))`
- A raw route options object: 
  ```
  { 
    authorizer: new HtttpUserPoolAuthorizer({userPoolClient, userPool}),
    integration: new LambdaProxyIntegration(new NodeJSFunction(stack, 'myFn', {entry: 'lib/my-node-function.ts'}))
  }
  ```
# Appsync

```ts
import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import { CfnOutput } from '@aws-cdk/core';
import { setupResolvers } from '@jet-cdk/afterburner/appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
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
          myQuery: 'lib/myQuery.ts',
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
      defaultOptions: (s) => resolver(lambda(nodejs(s))),
      // using 'compose-function':
      // defaultOptions: compose(resolver, lambda, nodejs),
    });

    table.grantReadWriteData(dataSources.Query.putItem.grantPrincipal);

    new CfnOutput(this, 'apiUrl', { value: api.graphqlUrl ?? '' });
  }
}
```

The main api for Appsync is `setupResolvers`. In the resolvers property, it takes one or both of 'Query' and 'Mutation' graphql types.
Each type contains a map from the graphql fields to resolvers, similar to the api gateway api. There are multiple ways to specify a resolver:
- A string, in which case the `defaultOptions` property will be used to map it to a resolver
- The supplied function `resolver`, which takes a builder for an datasource and properties, and returns a builder for a resolver.
  - Datasource builders for all supported types are supplied in `@jet-cdk/afterburner/appsync/datasources`
  - Or you can specify one yourself, as `DataSourceBuilder = (stack, id) -> DataSource`
- Or you can supply your own function, as `(DataSourceBuilder, props) -> (typeName, fieldName) -> DataSourceBuilder`

# Cognito

```ts
import { addTriggers } from "@jet-cdk/afterburner/cognito";
import nodejs from "@jet-cdk/afterburner/functions/nodejs";

const triggerFns = addTriggers(userPool, {
  triggers: {
    postConfirmation: nodejs({
      entry: "handlers/user/postConfirmation.ts",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    }),
    customMessage: nodejs("handlers/user/customMessage.ts")
  },
});

userTable.grantFullAccess(triggerFns.postConfirmation);
```

`addTriggers` is a helper function for adding triggers to a Cognito UserPool using the same Builder functions as is provided for ApiGateway and AppSync.
The function accepts a mapping from trigger names to function builders, and returns a similar mapping from function names to the built functions.