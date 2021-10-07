import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import {
  HttpServiceDiscoveryIntegration,
  HttpServiceDiscoveryIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for a service discovery integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function serviceDiscovery<A extends IHttpRouteAuthorizer>(
  props: HttpServiceDiscoveryIntegrationProps
): Builder<RouteOptions<HttpServiceDiscoveryIntegration, A>> {
  return builderOf({
    integration: new HttpServiceDiscoveryIntegration(props),
  });
}
