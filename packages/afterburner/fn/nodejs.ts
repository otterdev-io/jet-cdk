import {
  NodejsFunction,
  NodejsFunctionProps,
} from '@aws-cdk/aws-lambda-nodejs';
import { Builder } from '../common/lib';

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
export function nodejs(
  constructor: NodeFunctionConstructor
): Builder<NodejsFunction> {
  return (scope, id) => {
    if (typeof constructor === 'string') {
      return new NodejsFunction(scope, id, { entry: constructor });
    } else {
      return new NodejsFunction(scope, id, constructor);
    }
  };
}
