import {
  NodejsFunction,
  NodejsFunctionProps,
} from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { IFunction } from '@aws-cdk/aws-lambda';
import { FunctionBuilder } from './types';

/**
 *  Props to create a NodeFunction
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * NodeJSFunctionProps - Full constructor options for NodejsFunction
 */
export type NodeFunctionConstructor = string | NodejsFunctionProps;

/**
 * Create a builder for a NodejsFunction
 * Constructor options can be one of:
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * NodeJSFunctionProps - Full constructor options for NodejsFunction
 */
export function nodejs(constructor: NodeFunctionConstructor): FunctionBuilder {
  return (scope, id) => nodejsFunction(scope, id, constructor);
}

/**
 * Create a NodejsFunction
 * @param scope Parent construct
 * @param id Id of the function
 * @param constructor - Constructor Props
 * @returns the NodejsFunction
 */
export function nodejsFunction(
  scope: Construct,
  id: string,
  constructor: NodeFunctionConstructor
): IFunction {
  if (typeof constructor === 'string') {
    return new NodejsFunction(scope, id, { entry: constructor });
  } else {
    return new NodejsFunction(scope, id, constructor);
  }
}
