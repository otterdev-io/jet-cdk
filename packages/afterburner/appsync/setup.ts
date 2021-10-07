/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseDataSource, GraphqlApi } from '@aws-cdk/aws-appsync';
import { ResolverBuilder, DataSourceMap, ResolverMap } from './types';

/**
 * Route an Appsync api
 * @param api The api instance to route
 * @param routing Spec for routing. Refer to docs for examples
 * @returns An object mapping from type to field to handler
 */
export function setupResolvers<
  T extends { Query?: ResolverMap; Mutation?: ResolverMap }
>(api: GraphqlApi, resolvers: T): DataSourceMap<T> {
  const output = {} as DataSourceMap<T>;
  Object.entries(resolvers).forEach(([type, typeHandler]) => {
    if (typeHandler) {
      Object.entries(typeHandler).forEach(([field, fieldHandler]) => {
        if (fieldHandler) {
          const id = `${type}${field}`;
          //Type of datasource varies by entry
          const dataSource = fieldHandler(type, field)(api, id);
          if (!output[type as keyof DataSourceMap<T>]) {
            // @ts-ignore
            output[type as keyof DataSourceMap<T>] = { field: dataSource };
          } else {
            // @ts-ignore
            output[type as keyof DataSourceMap<T>][field] = dataSource;
          }
        }
      });
    }
  });
  return output;
}

export function resolverTag<DS extends BaseDataSource>(
  builder: (s: string) => ResolverBuilder<DS>
): (strings: TemplateStringsArray, ...expr: string[]) => ResolverBuilder<DS> {
  return (strings, ...expr) => {
    const str = strings.reduce(
      (total, str, i) => total + str + (expr[i] ?? '')
    );
    return builder(str);
  };
}
