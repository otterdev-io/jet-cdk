import {
  HttpLambdaAuthorizer,
  HttpLambdaAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Builder } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for user pool authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function lambdaAuthorizer(
  props: Omit<HttpLambdaAuthorizerProps, 'handler'> & {
    handler: Builder<IFunction>;
  },
  authorizationScopes: string[] | undefined,
  routeOptions: Builder<RouteOptions>
): Builder<RouteOptions> {
  return (scope, id) => {
    const handler = props.handler(scope, `fn${id}`);
    const builtProps = { ...props, handler };
    return {
      authorizer: new HttpLambdaAuthorizer(builtProps),
      authorizationScopes,
      ...routeOptions(scope, id),
    };
  };
}
