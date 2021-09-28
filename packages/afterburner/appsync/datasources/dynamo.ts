import {
  DataSourceOptions,
  DynamoDbDataSource,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { Builder } from '../../common/lib';

/**
 * Create a builder for a lambda datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A LambdaDataSource builder
 */
export default function dynamoDataSource(
  table: ITable,
  options?: DataSourceOptions
): Builder<DynamoDbDataSource, GraphqlApi> {
  return (api, id) => api.addDynamoDbDataSource(`ds${id}`, table, options);
}
