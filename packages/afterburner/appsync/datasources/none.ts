import {
  DataSourceOptions,
  GraphqlApi,
  NoneDataSource,
} from '@aws-cdk/aws-appsync';
import { Builder } from '../../common/lib';

/**
 * Create a builder for a none datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A NoneDataSource builder
 */
export default function noneDataSource(
  options?: DataSourceOptions
): Builder<NoneDataSource, GraphqlApi> {
  return (api, id) => api.addNoneDataSource(`ds${id}`, options);
}
