import { BaseDataSource, GraphqlApi } from '@aws-cdk/aws-appsync';
import { Builder } from '../common/lib';

export type DataSourceMap = Record<string, string | Builder<any, GraphqlApi>>;
/**
 * Top level GraphQL types
 */
export type GraphqlType = 'Query' | 'Mutation';

/**
 * Routing specification for an appsync API. A mapping from GraphqlType to
 * a record of fields mapping to data source builders
 */
export type ResolverSpec<T extends DataSourceMap> = Partial<
  Record<GraphqlType, T>
>;

/**
 * Map out fields to their builder return type, or the default type if its a string
 */
export type DataSourceFields<
  T extends DataSourceMap,
  D extends BaseDataSource
> = {
  [K in keyof T]: T[K] extends string
    ? D
    : T[K] extends Builder<infer H, GraphqlApi>
    ? H
    : never;
};

/**
 * Mapping from graphql type to a record of fields mapping to data sources
 * @type T the input map
 * @type D the default builder type
 */
export type ResolverConfig<
  T extends DataSourceMap,
  D extends BaseDataSource
> = Partial<Record<GraphqlType, DataSourceFields<T, D>>>;
