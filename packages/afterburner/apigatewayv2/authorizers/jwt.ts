import {
  HttpJwtAuthorizer,
  HttpJwtAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Builder } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for jwt authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function jwtAuthorizer(
  props: HttpJwtAuthorizerProps,
  authorizationScopes: string[] | undefined,
  routeOptions: Builder<RouteOptions>
): Builder<RouteOptions> {
  return (scope, id) => ({
    authorizer: new HttpJwtAuthorizer(props),
    authorizationScopes,
    ...routeOptions(scope, id),
  });
}
