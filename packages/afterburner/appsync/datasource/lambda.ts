import {
  LambdaDataSource,
  DataSourceOptions,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Builder } from '../../common/lib';

/**
 * Create a builder for a lambda datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A LambdaDataSource builder
 */
export function lambdaDataSource(
  functionBuilder: Builder<IFunction>,
  options?: DataSourceOptions
): Builder<LambdaDataSource, GraphqlApi> {
  return (api, id) =>
    api.addLambdaDataSource(id, functionBuilder(api.stack, id), options);
}
