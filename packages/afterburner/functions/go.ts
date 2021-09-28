import { GoFunction, GoFunctionProps } from '@aws-cdk/aws-lambda-go';
import { Builder } from '../common/lib';

/**
 * Props to create a Go function
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * GoFunctionProps - Full constructor options for GoFunction
 */
export type GoFunctionConstructor = string | GoFunctionProps;

/**
 * Create a builder for a GoFunction
 * Constructor options can be one of:
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * GoFunctionProps - Full constructor options for GoFunction
 */
export default function go(
  constructor: GoFunctionConstructor
): Builder<GoFunction> {
  return (scope, id) => {
    if (typeof constructor === 'string') {
      return new GoFunction(scope, id, { entry: constructor });
    } else {
      return new GoFunction(scope, id, constructor);
    }
  };
}
