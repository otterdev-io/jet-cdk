import {
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../lib';
import { RouteOptions } from './types';

export function withOptions<
  T extends IHttpRouteIntegration,
  A extends IHttpRouteAuthorizer
>(
  options: Builder<Omit<RouteOptions<T, A>, 'integration'>>
): (
  opt: Builder<RouteOptions<T, IHttpRouteAuthorizer>>
) => Builder<RouteOptions<T, A>> {
  //@ts-expect-error "Match A"
  return (opt) => (scope, id) => ({ ...opt(scope, id), ...options(scope, id) });
}
