import {
  HttpDataSource,
  HttpDataSourceOptions,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { Builder } from '../../common/lib';

/**
 * Create a builder for a http datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A HttpDataSource builder
 */
export default function httpDataSource(
  endpoint: string,
  options?: HttpDataSourceOptions
): Builder<HttpDataSource, GraphqlApi> {
  return (api, id) => api.addHttpDataSource(`ds${id}`, endpoint, options);
}
