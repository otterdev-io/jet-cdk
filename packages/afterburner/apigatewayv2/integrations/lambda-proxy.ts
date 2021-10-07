import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';

export interface LambdaProxyWithHandlerIntegration
  extends LambdaProxyIntegration {
  handler: IFunction;
}

/**
 * A builder for a lambda proxy integration
 * @param integration A FunctionBuilder that will create the lambda to integrate
 * @returns A LambdaProxyIntegration Builder
 */
export default function lambdaProxy<A extends IHttpRouteAuthorizer>(
  fn: Builder<IFunction>
): Builder<RouteOptions<LambdaProxyWithHandlerIntegration, A>> {
  return (stack, id) => {
    const handler = fn(stack, `fn${id}`);
    const integration = new LambdaProxyIntegration({
      handler,
    }) as LambdaProxyWithHandlerIntegration;
    integration.handler = handler;
    const routeOptions = {
      integration,
    };
    return routeOptions;
  };
}
