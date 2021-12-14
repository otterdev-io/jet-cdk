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
import { withOptions } from '../with-options';
/**
 * A builder for jwt authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function jwtAuthorizer<T extends IHttpRouteIntegration>(
  props: HttpJwtAuthorizerProps
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, HttpJwtAuthorizer>> {
  return withOptions((_scope, id) => ({
    authorizer: new HttpJwtAuthorizer({
      authorizerName: `${id}-authorizer`,
      ...props,
    }),
  }));
}
