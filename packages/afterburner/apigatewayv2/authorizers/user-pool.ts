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
import { withOptions } from '../with-options';
/**
 * A builder for user pool authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function userPoolAuthorizer<T extends IHttpRouteIntegration>(
  props: UserPoolAuthorizerProps
): (
  routeOptions: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, HttpUserPoolAuthorizer>> {
  return withOptions((_scope, id) => ({
    authorizer: new HttpUserPoolAuthorizer({
      authorizerName: `${id}-authorizer`,
      ...props,
    }),
  }));
}
