import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';

export function withAuthorizer<
  T extends IHttpRouteIntegration,
  A extends IHttpRouteAuthorizer
>(
  authorizer: Builder<A>,
  authorizationScopes?: string[]
): (
  options: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, A>> {
  return (options) => (scope, id) => ({
    ...options(scope, id),
    authorizer: authorizer(scope, id),
    authorizationScopes: authorizationScopes,
  });
}
