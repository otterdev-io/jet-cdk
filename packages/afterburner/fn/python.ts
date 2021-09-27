import {
  PythonFunction,
  PythonFunctionProps,
} from '@aws-cdk/aws-lambda-python';
import { Builder } from '../common/lib';

/**
 * Props to create a Python function
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * PythonFunctionProps - Full constructor options for PythonFunction
 */
export type PythonFunctionConstructor = string | PythonFunctionProps;

/**
 * Create a builder for a PythonFunction
 * Constructor options can be one of:
 * string - sets just the 'entry' file. Uses the CDK behaviour of assuming the handler function is exported as 'handler'
 * PythonFunctionProps - Full constructor options for PythonFunction
 */
export function python(
  constructor: PythonFunctionConstructor
): Builder<PythonFunction> {
  return (scope, id) => {
    if (typeof constructor === 'string') {
      return new PythonFunction(scope, id, { entry: constructor });
    } else {
      return new PythonFunction(scope, id, constructor);
    }
  };
}
