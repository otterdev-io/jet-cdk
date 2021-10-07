import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import {
  HttpNlbIntegration,
  HttpNlbIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for a nlb integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function nlb<A extends IHttpRouteAuthorizer>(
  props: HttpNlbIntegrationProps
): Builder<RouteOptions<HttpNlbIntegration, A>> {
  return builderOf({
    integration: new HttpNlbIntegration(props),
  });
}
