import {
  DataSourceOptions,
  RdsDataSource,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { IServerlessCluster } from '@aws-cdk/aws-rds';
import { ISecret } from '@aws-cdk/aws-secretsmanager';
import { Builder } from '../../lib';

/**
 * Create a builder for a rds datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A RdsDataSource builder
 */
export default function rdsDataSource(
  serverlessCluster: IServerlessCluster,
  secretStore: ISecret,
  databaseName?: string,
  options?: DataSourceOptions
): Builder<RdsDataSource, GraphqlApi> {
  return (api, id) =>
    api.addRdsDataSource(
      `ds${id}`,
      serverlessCluster,
      secretStore,
      databaseName,
      options
    );
}
