import {
  HttpUserPoolAuthorizer,
  UserPoolAuthorizerProps,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Builder } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for user pool authorizer
 * @param props authorizer props
 * @returns RouteOptions builder
 */
export default function userPoolAuthorizer(
  props: UserPoolAuthorizerProps,
  authorizationScopes: string[] | undefined,
  routeOptions: Builder<RouteOptions>
): Builder<RouteOptions> {
  return (scope, id) => ({
    authorizer: new HttpUserPoolAuthorizer(props),
    authorizationScopes,
    ...routeOptions(scope, id),
  });
}
