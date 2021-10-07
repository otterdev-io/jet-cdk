import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import {
  HttpLambdaAuthorizer,
  HttpLambdaAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for user pool authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function lambdaAuthorizer<T extends IHttpRouteIntegration>(
  props: Omit<HttpLambdaAuthorizerProps, 'handler'> & {
    handler: Builder<IFunction>;
  },
  authorizationScopes?: string[]
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, HttpLambdaAuthorizer>> {
  return (routeOptions) => (scope, id) => {
    const handler = props.handler(scope, `fn${id}`);
    const builtProps = { ...props, handler };
    const authorizer = new HttpLambdaAuthorizer(
      builtProps
    ) as HttpLambdaAuthorizerWithHandler;
    authorizer.handler = handler;
    return {
      ...routeOptions(scope, id),
      authorizer,
      authorizationScopes,
    };
  };
}

export interface HttpLambdaAuthorizerWithHandler extends HttpLambdaAuthorizer {
  handler: IFunction;
}
