import {
  HttpAlbIntegration,
  HttpAlbIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for a alb integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function alb(
  props: HttpAlbIntegrationProps
): Builder<RouteOptions> {
  return builderOf({
    integration: new HttpAlbIntegration(props),
  });
}
