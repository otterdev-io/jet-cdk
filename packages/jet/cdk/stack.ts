import { CfnOutput, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import json5 from 'json5';
import fsp from 'fs/promises';
import { OutputsFile } from '../flight/commands/common/types';

export function jetOutput(scope: Stack) {
  const assemblyOutDir = scope.node.tryGetContext('jet:assembly-out-dir');
  const outputsStack = scope as unknown as { outputsFiles?: OutputsFile[] };

  //Full outputs in dev mode
  if (scope.node.tryGetContext('jet:dev') && assemblyOutDir) {
    const functions = scope.node
      .findAll()
      .flatMap((c) =>
        isIFunction(c) && hasCfnResource(c) && c.functionName ? [c] : []
      );
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
        id: scope.node.id,
        functions: outputFunctions,
        assemblyOutDir,
        outputsFiles: outputsStack.outputsFiles ?? [],
      }),
    });
    //Only outputsFiles if necessary in deploy mode
  } else if (scope.node.tryGetContext('jet:jet') && outputsStack.outputsFiles) {
    new CfnOutput(scope, 'jet', {
      value: JSON.stringify({
        outputsFiles: outputsStack.outputsFiles ?? [],
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

export function outputsFile(stack: Stack, file: OutputsFile) {
  const outputsStack = stack as unknown as { outputsFiles?: OutputsFile[] };
  if (!outputsStack.outputsFiles) {
    outputsStack.outputsFiles = [];
  }
  outputsStack.outputsFiles.push(file);
  // Mainly to trigger redeploy
  stack.node.addMetadata('Jet::OutputsFile', file);
}
