import {
  BaseDataSource,
  BaseResolverProps,
  GraphqlApi,
} from '@aws-cdk/aws-appsync';
import { Builder } from '../lib';

/**
 * Create a builder for a lambda datasource
 * @param functionBuilder builder for the lambda function
 * @param options DataSource options
 * @returns A LambdaDataSource builder
 */
export default function resolver<T extends BaseDataSource>(
  datasource: Builder<T, GraphqlApi>,
  resolverProps?: Omit<BaseResolverProps, 'typeName' | 'fieldName'>
): (typeName: string, fieldName: string) => Builder<T, GraphqlApi> {
  return (typeName, fieldName) => (api, id) => {
    const ds = datasource(api, id);
    ds.createResolver({ typeName, fieldName, ...resolverProps });
    return ds;
  };
}
