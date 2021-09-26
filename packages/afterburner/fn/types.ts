import { Construct } from '@aws-cdk/core';
import { IFunction } from '@aws-cdk/aws-lambda';

/**
 * A function which will create an IFunction, when passed scope and path
 */
export type FunctionBuilder = (scope: Construct, id: string) => IFunction;
