import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../../common/lib';
import { RouteOptions } from '../types';

export function withAuthorizer(
  authorizer: Builder<IHttpRouteAuthorizer>,
  authorizationScopes: string[] | undefined,
  options: Builder<RouteOptions>
): Builder<RouteOptions> {
  return (scope, id) => ({
    authorizer: authorizer(scope, id),
    authorizationScopes: authorizationScopes,
    ...options(scope, id),
  });
}
