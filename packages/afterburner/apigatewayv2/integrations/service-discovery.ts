import {
  HttpServiceDiscoveryIntegration,
  HttpServiceDiscoveryIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for a service discovery integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function serviceDiscovery(
  props: HttpServiceDiscoveryIntegrationProps
): Builder<RouteOptions> {
  return builderOf({
    integration: new HttpServiceDiscoveryIntegration(props),
  });
}
