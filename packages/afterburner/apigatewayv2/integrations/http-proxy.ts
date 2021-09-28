import {
  HttpProxyIntegration,
  HttpProxyIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for a http proxy integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function httpProxy(
  props: HttpProxyIntegrationProps
): Builder<RouteOptions> {
  return builderOf({
    integration: new HttpProxyIntegration(props),
  });
}
