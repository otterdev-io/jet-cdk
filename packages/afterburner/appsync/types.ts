import { GraphqlApi, BaseDataSource } from '@aws-cdk/aws-appsync';

export type DataSourceMap = Record<string, DataSourceBuilder<any>>;
/**
 * Top level GraphQL types
 */
export type GraphqlType = 'Query' | 'Mutation';

/**
 * Routing specification for an appsync API. A mapping from GraphqlType to
 * a record of fields mapping to data source builders
 */
export type RoutingSpec<T extends DataSourceMap> = Partial<
  Record<GraphqlType, T>
>;

export type DataSourceBuilder<H extends BaseDataSource> = (
  api: GraphqlApi,
  id: string
) => H;

export type DataSourceFields<T extends DataSourceMap> = {
  [K in keyof T]: T[K] extends DataSourceBuilder<infer H> ? H : never;
};

/**
 * Mapping from graphql type to a record of fields mapping to data sources
 */
export type Routing<T extends DataSourceMap> = Partial<
  Record<GraphqlType, DataSourceFields<T>>
>;
