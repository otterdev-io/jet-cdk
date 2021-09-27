import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Builder } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for a lambda proxy integration
 * @param integration A FunctionBuilder that will create the lambda to integrate
 * @returns A LambdaProxyIntegration Builder
 */
export function lambdaProxy(fn: Builder<IFunction>): Builder<RouteOptions> {
  return (stack, id) => ({
    integration: new LambdaProxyIntegration({
      handler: fn(stack, `lambda-${id}`),
    }),
  });
}
