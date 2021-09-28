import { CfnOutput, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import json5 from 'json5';
import fsp from 'fs/promises';

export function jetOutput(scope: Stack) {
  const assemblyOutDir = scope.node.tryGetContext('jet:assembly-out-dir');
  if (scope.node.tryGetContext('jet:dev') && assemblyOutDir) {
    const functions = scope.node
      .findAll()
      .flatMap((c) => (isIFunction(c) ? [c] : []));
    const outputFunctions = functions.map((f) => ({
      id: f.node.id,
      name: f.functionName,
    }));
    const synthFunctions = functions.map((f) => ({
      id: f.node.id,
      path: (f.node.defaultChild as CfnResource).getMetadata('aws:asset:path'),
    }));

    fsp.writeFile(
      `${assemblyOutDir}/${scope.stackName}.functions.json5`,
      json5.stringify(synthFunctions, undefined, 2)
    );
    new CfnOutput(scope, 'jet', {
      value: JSON.stringify({
        functions: outputFunctions,
        assemblyOutDir,
      }),
    });
  }
}

function isIFunction(c: IConstruct): c is lambda.IFunction {
  return 'functionArn' in c;
}
