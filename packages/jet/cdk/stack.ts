import {
  CfnOutput,
  CfnResource,
  Construct,
  IConstruct,
  Stack,
} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import json5 from 'json5';
import fsp from 'fs/promises';
import { WriteValues } from '../flight/commands/common/types';

const keyWriteValues = 'jet:writeValues';

export function jetOutput(scope: Stack) {
  const assemblyOutDir = scope.node.tryGetContext('jet:assembly-out-dir');
  if (scope.node.tryGetContext('jet:dev') && assemblyOutDir) {
    const functions = scope.node
      .findAll()
      .flatMap((c) => (isIFunction(c) && hasCfnResource(c) ? [c] : []));
    const outputFunctions = functions.map((f) => ({
      id: f.node.id,
      name: f.functionName,
    }));
    const synthFunctions = functions.map((f) => ({
      id: f.node.id,
      path: f.node.defaultChild.getMetadata('aws:asset:path'),
    }));

    fsp.writeFile(
      `${assemblyOutDir}/${scope.stackName}.functions.json5`,
      json5.stringify(synthFunctions, undefined, 2)
    );

    new CfnOutput(scope, 'jet', {
      value: JSON.stringify({
        functions: outputFunctions,
        assemblyOutDir,
        writeValues: (scope as any)[keyWriteValues],
      }),
    });
  }
}

function isIFunction(c: IConstruct): c is lambda.IFunction {
  return 'functionArn' in c;
}

function hasCfnResource(
  f: lambda.IFunction
): f is lambda.IFunction & { node: { defaultChild: CfnResource } } {
  return (f.node.defaultChild as CfnResource)?.getMetadata != null;
}

export async function writeValues(scope: Construct, props: WriteValues) {
  const writeValues: WriteValues[] = (scope as any)[keyWriteValues] ?? [];
  (scope as any)[keyWriteValues] = [...writeValues, props];
}
