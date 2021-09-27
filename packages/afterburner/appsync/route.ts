import { BaseDataSource, GraphqlApi } from '@aws-cdk/aws-appsync';
import { Builder } from '../common/lib';
import {
  DataSourceFields,
  DataSourceMap,
  GraphqlType,
  ResolverConfig,
  ResolverSpec,
} from './types';

/**
 * Route an Appsync api
 * @param api The api instance to route
 * @param routing Spec for routing. Refer to docs for examples
 * @returns An object mapping from type to field to handler
 */
export function setupResolvers<
  T extends DataSourceMap,
  D extends BaseDataSource
>(
  api: GraphqlApi,
  props: {
    resolvers: ResolverSpec<T>;
    defaultResolver?: (s: string) => Builder<D, GraphqlApi>;
  }
): ResolverConfig<T, D> {
  const output: ResolverConfig<T, D> = {};
  Object.entries(props.resolvers).forEach(([type, typeHandler]) => {
    if (typeHandler) {
      Object.entries(typeHandler).forEach(([field, fieldHandler]) => {
        if (fieldHandler) {
          const id = `${type}-${field}`;
          let dataSource: BaseDataSource;
          if (typeof fieldHandler === 'string') {
            if (!props.defaultResolver) {
              throw new Error(
                'Need to specify default resolver to use a string spec'
              );
            }
            dataSource = props.defaultResolver(fieldHandler)(api, id);
          } else {
            dataSource = fieldHandler(api, id);
          }
          dataSource.createResolver({
            typeName: type,
            fieldName: field,
          });
          const gqlType = type as GraphqlType;
          if (!output[gqlType]) {
            output[gqlType] = {} as DataSourceFields<T, D>;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          output[gqlType]![field as keyof T] = dataSource as any;
        }
      });
    }
  });
  return output;
}
