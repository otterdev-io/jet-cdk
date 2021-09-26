import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { FunctionBuilder } from '../fn/types';
import {
  DataSourceBuilder,
  DataSourceFields,
  DataSourceMap,
  GraphqlType,
  Routing,
  RoutingSpec,
} from './types';

/**
 * Route an Appsync api
 * @param api The api instance to route
 * @param routing Spec for routing. Refer to docs for examples
 * @returns An object mapping from type to field to handler
 */
export function route<T extends DataSourceMap>(
  api: GraphqlApi,
  routing: RoutingSpec<T>
): Routing<T> {
  const output: Routing<T> = {};
  Object.entries(routing).forEach(([type, typeHandler]) => {
    if (typeHandler) {
      Object.entries(typeHandler).forEach(([field, fieldHandler]) => {
        if (fieldHandler) {
          const id = `${type}-${field}`;
          const dataSource = fieldHandler(api, id);
          dataSource.createResolver({
            typeName: type,
            fieldName: field,
          });
          const gqlType = type as GraphqlType;
          if (!output[gqlType]) {
            output[gqlType] = {} as DataSourceFields<T>;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          output[gqlType]![field as keyof T] = dataSource;
        }
      });
    }
  });
  return output;
}
