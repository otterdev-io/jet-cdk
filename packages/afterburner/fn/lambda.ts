import { Function, FunctionProps } from '@aws-cdk/aws-lambda';
import { FunctionBuilder } from './types';

/**
 * Create a Builder for a 'Function'
 * @param constructor Props for creating the lambda
 * @returns A builder for a lambda function
 */
export function lambda(constructor: FunctionProps): FunctionBuilder {
  return (scope, id) => new Function(scope, id, constructor);
}
