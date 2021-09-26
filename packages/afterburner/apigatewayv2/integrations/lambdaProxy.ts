import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { FunctionBuilder } from '../../fn/types';
import { RouteIntegrationBuilder } from '../types';

/**
 * A builder for a lambda proxy integration
 * @param integration A FunctionBuilder that will create the lambda to integrate
 * @returns A LambdaProxyIntegration RouteIntegrationBuilder
 */
export function lambdaProxy(fn: FunctionBuilder): RouteIntegrationBuilder {
  return (stack, id) => new LambdaProxyIntegration({ handler: fn(stack, id) });
}
