import {
  DataSourceOptions,
  ElasticsearchDataSource,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { IDomain } from '@aws-cdk/aws-elasticsearch';
import { Builder } from '../../lib';
/**
 * Create a builder for a elasticsearch datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A ElasticSearchDataSource builder
 */
export default function elasticSearchDataSource(
  domain: IDomain,
  options?: DataSourceOptions
): Builder<ElasticsearchDataSource, GraphqlApi> {
  return (api, id) =>
    api.addElasticsearchDataSource(`ds${id}`, domain, options);
}
