import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';
export default function authorizationScoped<T extends IHttpRouteIntegration>(
  authorizationScopes?: string[]
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, IHttpRouteAuthorizer>> {
  return (routeOptions) => (scope, id) => ({
    ...routeOptions(scope, id),
    authorizationScopes,
  });
}
