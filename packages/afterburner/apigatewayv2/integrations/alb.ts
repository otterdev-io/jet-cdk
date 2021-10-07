import { IHttpRouteAuthorizer } from '@aws-cdk/aws-apigatewayv2';
import {
  HttpAlbIntegration,
  HttpAlbIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../lib';
import { RouteOptions } from '../types';
/**
 * A builder for a alb integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function alb<A extends IHttpRouteAuthorizer>(
  props: HttpAlbIntegrationProps
): Builder<RouteOptions<HttpAlbIntegration, A>> {
  return builderOf({
    integration: new HttpAlbIntegration(props),
  });
}
