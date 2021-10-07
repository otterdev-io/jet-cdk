import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import {
  HttpProxyIntegration,
  HttpProxyIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for a http proxy integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function httpProxy<A extends IHttpRouteAuthorizer>(
  props: HttpProxyIntegrationProps
): Builder<RouteOptions<HttpProxyIntegration, A>> {
  return builderOf({
    integration: new HttpProxyIntegration(props),
  });
}
