import { Function as LambdaFunction, FunctionProps } from '@aws-cdk/aws-lambda';
import { Builder } from '../common/lib';

/**
 * Create a Builder for a 'Function'
 * @param constructor Props for creating the lambda
 * @returns A builder for a lambda function
 */
export function lambda(constructor: FunctionProps): Builder<LambdaFunction> {
  return (scope, id) => new LambdaFunction(scope, id, constructor);
}
