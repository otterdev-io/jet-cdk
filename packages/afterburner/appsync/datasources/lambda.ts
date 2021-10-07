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
export default function lambdaDataSource(
  functionBuilder: Builder<IFunction>,
  options?: DataSourceOptions
): Builder<LambdaDataSourceWithFunction, GraphqlApi> {
  return (api, id) => {
    const fn = functionBuilder(api.stack, `fn${id}`);
    const ds = api.addLambdaDataSource(
      `ds${id}`,
      fn,
      options
    ) as LambdaDataSourceWithFunction;
    ds.lambdaFunction = fn;
    return ds;
  };
}

interface LambdaDataSourceWithFunction extends LambdaDataSource {
  lambdaFunction: IFunction;
}
