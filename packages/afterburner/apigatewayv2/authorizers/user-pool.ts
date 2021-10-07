import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import {
  HttpUserPoolAuthorizer,
  UserPoolAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for user pool authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function userPoolAuthorizer<T extends IHttpRouteIntegration>(
  props: UserPoolAuthorizerProps,
  authorizationScopes?: string[]
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, HttpUserPoolAuthorizer>> {
  return (routeOptions) => (scope, id) => ({
    ...routeOptions(scope, id),
    authorizer: new HttpUserPoolAuthorizer(props),
    authorizationScopes,
  });
}
