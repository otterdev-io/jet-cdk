import * as cdk from '@aws-cdk/core';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { CfnOutput } from '@aws-cdk/core';

import { route } from '@jet-cdk/afterburner/apigatewayv2';
import nodejs from '@jet-cdk/afterburner/functions/nodejs';
import lambda from '@jet-cdk/afterburner/apigatewayv2/integrations/lambda-proxy';

export class TestAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new HttpApi(this, 'api');

    route(api, {
      routes: {
        '/my': { GET: 'lib/my-function.ts' },
      },
      defaultOptions: (s) => lambda(nodejs(s)),
    });

    new CfnOutput(this, 'apiUrl', { value: api.url ?? '' });
  }
}
