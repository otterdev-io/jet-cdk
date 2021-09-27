# afterburner

Afterburner is a set of functions that provide an elegant, yet powerful api to building a serverless app, with a focus on streamlining lambda function integration.

It is part of Jet-CDK, a toolkit to simplify serverless app development.
Despite this, although it pairs well with the Jet environment, with its live lambda reloading, Afterburner can be used standalone.

It currently provides:
	- an api to setup routing for API Gateway V2
	- an api to setup resolves for Appsync.

More documentation to come!
# API Gateway examples

```ts

import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { lambdaProxy, route } from '@jet-cdk/afterburner/apigatewayv2';
import { nodejs } from '@jet-cdk/afterburner/fn';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const api = new HttpApi(this, 'api');

    route(api, {
      routes: {
        '/my': { GET: 'lib/my-node-function.ts' },
        '/yours': { GET: 'lib/your-node-function.ts' },
      },
      defaultOptions: (s) => lambdaProxy(nodejs(s)),
    });

    new CfnOutput(this, 'apiUrl', { value: api.url ?? '' });
  }
}
```

```ts

import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { lambdaProxy, route } from '@jet-cdk/afterburner/apigatewayv2';
import { python } from '@jet-cdk/afterburner/fn';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const api = new HttpApi(this, 'api');

    route(api, {
      routes: {
        '/test': { 
					GET: lambdaProxy(python({entry: 'lib/test-node-function.py', handler: 'get'})),
					POST: lambdaProxy(python({'lib/test-node-function.py')) 
					},
      },
    });

    new CfnOutput(this, 'apiUrl', { value: api.url ?? '' });
  }
}
```

# Appsync

```ts
import * as cdk from '@aws-cdk/core';
import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { CfnOutput } from '@aws-cdk/core';
import { lambdaDataSource, setupResolvers } from '@jet-cdk/afterburner/appsync';
import { nodejs } from '@jet-cdk/afterburner/fn';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'api', { name: 'app' });
    setupResolvers(api, {
      resolvers: {
        Query: {
          myQuery: lambdaDataSource(nodejs('lib/myQuery.ts')),
        },
      },
    });

    new CfnOutput(this, 'apiUrl', { value: api.graphqlUrl ?? '' });
  }
}
```

```ts
import * as cdk from '@aws-cdk/core';
import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { CfnOutput } from '@aws-cdk/core';
import { lambdaDataSource, setupResolvers } from '@jet-cdk/afterburner/appsync';
import { nodejs } from '@jet-cdk/afterburner/fn';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'api', { name: 'app' });

    setupResolvers(api, {
      defaultResolver: (s) => lambdaDataSource(nodejs(s)),
      resolvers: {
        Query: {
          myQuery: 'lib/myQuery.ts',
          yourQuery: 'lib/yourQuery.ts'
        },
      },
    });

    new CfnOutput(this, 'apiUrl', { value: api.graphqlUrl ?? '' });
  }
}
```

```ts
import * as cdk from '@aws-cdk/core';
import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { CfnOutput } from '@aws-cdk/core';
import { lambdaDataSource, setupResolvers } from '@jet-cdk/afterburner/appsync';
import { nodejs, go } from '@jet-cdk/afterburner/fn';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'api', { name: 'app' });

    setupResolvers(api, {
      defaultResolver: (s) => lambdaDataSource(nodejs(s)),
      resolvers: {
        Query: {
          myQuery: 'lib/myQuery.ts',
          yourQuery: lambdaDataSource(python({entry: 'lib/yourQuery.ts', handler: 'handle'}))
        },
      },
    });

    new CfnOutput(this, 'apiUrl', { value: api.graphqlUrl ?? '' });
  }
}
```