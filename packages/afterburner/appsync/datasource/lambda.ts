import { LambdaDataSource, DataSourceOptions } from '@aws-cdk/aws-appsync';
import { FunctionBuilder } from '../../fn/types';
import { DataSourceBuilder } from '../types';

/**
 * Create a builder for a lambda datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A LambdaDataSource builder
 */
export function lambdaDataSource(
  functionBuilder: FunctionBuilder,
  options?: DataSourceOptions
): DataSourceBuilder<LambdaDataSource> {
  return (api, id) =>
    api.addLambdaDataSource(id, functionBuilder(api.stack, id), options);
}
