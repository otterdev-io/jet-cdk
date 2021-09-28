import {
  HttpNlbIntegration,
  HttpNlbIntegrationProps,
} from '@aws-cdk/aws-apigatewayv2-integrations';
import { Builder, builderOf } from '../../common/lib';
import { RouteOptions } from '../types';
/**
 * A builder for a nlb integration
 * @param props Integration props
 * @returns RouteOptions
 */

export default function nlb(
  props: HttpNlbIntegrationProps
): Builder<RouteOptions> {
  return builderOf({
    integration: new HttpNlbIntegration(props),
  });
}
