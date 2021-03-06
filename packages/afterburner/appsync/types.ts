import { BaseDataSource, GraphqlApi } from '@aws-cdk/aws-appsync';
import { Builder } from '../lib';

/**
 * A function that will build a resolver, and return our dataSource D
 */
export type ResolverBuilder<D> = (
  typeName: string,
  fieldName: string
) => Builder<D, GraphqlApi>;

export type ResolverMap = Record<string, ResolverBuilder<BaseDataSource>>;

/**
 * Map out fields to their builder return type, or the default type if its a string
 */
export type DataSourceFields<R extends ResolverMap> = {
  [K in keyof R]: R[K] extends ResolverBuilder<infer DS> ? DS : never;
};

/**
 * Mapping from graphql type to a record of fields mapping to data sources
 * @type T types mapped, from 'Query' and 'Mutation'
 * @type R mapping of
 * @type D the default builder type
 */
export type DataSourceMap<
  T extends { Query?: ResolverMap; Mutation?: ResolverMap }
> = (T extends { Query?: infer Q }
  ? Q extends ResolverMap
    ? { Query: DataSourceFields<Q> }
    : Record<string, never>
  : Record<string, never>) &
  (T extends { Mutation?: infer M }
    ? M extends ResolverMap
      ? { Mutation: DataSourceFields<M> }
      : Record<string, never>
    : Record<string, never>);
