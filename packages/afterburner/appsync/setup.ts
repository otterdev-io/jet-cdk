/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseDataSource, GraphqlApi } from '@aws-cdk/aws-appsync';
import {
  DataSourceFields,
  ResolverBuilder,
  DataSourceMap,
  ResolverMap,
} from './types';

/**
 * Route an Appsync api
 * @param api The api instance to route
 * @param routing Spec for routing. Refer to docs for examples
 * @returns An object mapping from type to field to handler
 */
export function setupResolvers<
  T extends { Query?: ResolverMap; Mutation?: ResolverMap },
  D extends BaseDataSource
>(
  api: GraphqlApi,
  props: {
    resolvers: T;
    defaultOptions?: (s: string) => ResolverBuilder<D>;
  }
): DataSourceMap<T, D> {
  const output = {} as DataSourceMap<T, D>;
  Object.entries(props.resolvers).forEach(([type, typeHandler]) => {
    if (typeHandler) {
      Object.entries(typeHandler).forEach(([field, fieldHandler]) => {
        if (fieldHandler) {
          const id = `${type}${field}`;
          //Type of datasource varies by entry
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let dataSource: any;
          if (typeof fieldHandler === 'string') {
            if (!props.defaultOptions) {
              throw new Error(
                'Need to specify default resolver to use a string spec'
              );
            }
            dataSource = props.defaultOptions(fieldHandler)(type, field)(
              api,
              id
            );
          } else {
            dataSource = fieldHandler(type, field)(api, id);
          }
          if (!output[type as keyof DataSourceMap<T, D>]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            output[type as keyof DataSourceMap<T, D>] = {} as any;
          }
          // @ts-ignore
          output[type as keyof DataSourceMap<T, D>][field] = dataSource;
        }
      });
    }
  });
  return output;
}
