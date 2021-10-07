import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import {
  HttpJwtAuthorizer,
  HttpJwtAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Builder } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for jwt authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function jwtAuthorizer<T extends IHttpRouteIntegration>(
  props: HttpJwtAuthorizerProps,
  authorizationScopes?: string[]
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, HttpJwtAuthorizer>> {
  return (routeOptions) => (scope, id) => ({
    ...routeOptions(scope, id),
    authorizer: new HttpJwtAuthorizer(props),
    authorizationScopes,
  });
}
