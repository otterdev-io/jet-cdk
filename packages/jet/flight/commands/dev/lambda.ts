import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import { outFilePath, runCdk } from '../../core/run-cdk';
import { Lambda } from '@aws-sdk/client-lambda';
import zip from 'jszip';
import fsp from 'fs/promises';
import { DeployedFunction, JetOutput, SynthedFunction } from '../common/types';
import { tailLogs } from './logs';
import { stackFilter } from '../../core/config';
import chalk from 'chalk';
import { usagePrompt } from './prompt';
import json5 from 'json5';
import { getStacks } from '../common/outFile';
import { ReInterval } from 'reinterval';

const lambda = new Lambda({});
export async function processLambdas(
  doUpload: boolean,
  config: BaseConfigWithUserAndCommandStage<'dev'>
): Promise<ReInterval[]> {
  if (doUpload) {
    runCdk('synth', {
      cwd: config.projectDir,
      jetOutDir: config.outDir,
      context: { dev: 'true' },
      args: [
        ...config.dev.synthArgs,
        stackFilter(config.dev.stage, { user: config.user }),
      ],
    });
    console.info('\nUploading lambdas...\n');
  } else {
    console.info(
      chalk.greenBright(chalk.bgBlack('Lambdas appear fresh, skipping upload'))
    );
  }
  const stacks = await getStacks(config.outDir);
  if (!Object.keys(stacks).length) {
    console.info(chalk.bold('No stacks'));
    usagePrompt();
  }

  Object.entries(stacks).forEach(async ([stackName, stack]) => {
    console.log();
    console.info(chalk.bold(stackName));
    console.info(chalk.bold('Stack outputs (jet hidden):'));
    const { jet, ...rest } = stack;
    Object.entries(rest).forEach(([key, value]) => {
      console.info(chalk.blueBright(chalk.bgBlack(`${key}: ${value}`)));
    });
    console.log();
  });

  const stackFunctions = (
    await Promise.all(
      Object.entries(stacks).map(async ([stackName, stack]) => {
        if (!stack.jet) {
          console.error(
            'No jet value in stack output. Did you add the jet function to the end?'
          );
          return [];
        }
        const jetOutput: JetOutput = await JSON.parse(stack.jet);
        return [{ stackName, jetOutput }];
      })
    )
  ).flatMap((s) =>
    s.flatMap((ss) =>
      ss.jetOutput.functions.map(
        (fn) =>
          [
            fn.id,
            {
              stackName: ss.stackName,
              assemblyOutDir: ss.jetOutput.assemblyOutDir,
              fn,
            },
          ] as const
      )
    )
  );
  //Deduplicate by id
  const stackFunctionsDict = new Map(stackFunctions);

  if ([...stackFunctionsDict.keys()].length === 0) {
    console.info('Redeploy once you have some lambdas');
    usagePrompt();
    return [];
  } else {
    const tails = Promise.all(
      [...stackFunctionsDict.values()].map(
        async ({ stackName, assemblyOutDir, fn }) => {
          if (doUpload) {
            console.info(`Uploading ${fn.name}`);
            await upload(stackName, assemblyOutDir, fn);
          }
          return tailLogs(fn);
        }
      )
    );
    usagePrompt();
    return tails;
  }
}

async function upload(
  stackName: string,
  assemblyOutDir: string,
  fn: DeployedFunction
) {
  const zipped = await makeZip(stackName, assemblyOutDir, fn);
  if (zipped) {
    return updateLambda(zipped, fn);
  } else {
    console.error('Failed to update');
    return null;
  }
}

async function makeZip(
  stackName: string,
  assemblyOutDir: string,
  fn: DeployedFunction
) {
  const fnFile = await fsp.readFile(
    `${assemblyOutDir}/${stackName}.functions.json5`
  );
  const synthFns: SynthedFunction[] = json5.parse(fnFile.toString());
  const synthFn = synthFns.find((f) => f.id === fn.id);
  if (!synthFn) {
    console.error(
      chalk.redBright(chalk.bgBlack("Can't find function in synth output"))
    );
    return null;
  }
  const assetPath = `${assemblyOutDir}/${synthFn.path}`;
  const assetZip = new zip();
  const assetFilePaths = await fsp.readdir(assetPath);
  const assetFiles = await Promise.all(
    assetFilePaths
      .filter((f) => f.endsWith('.js'))
      .map(async (f) => ({
        path: f,
        contents: await fsp.readFile(`${assetPath}/${f}`),
      }))
  );
  assetFiles.forEach(({ path, contents }) => assetZip.file(path, contents));
  return await assetZip.generateAsync({
    type: 'uint8array',
  });
}

async function updateLambda(zip: Uint8Array, fn: DeployedFunction) {
  const response = await lambda.updateFunctionCode({
    FunctionName: fn.name,
    ZipFile: zip,
  });
  console.info(response.LastUpdateStatus);
}

export async function lambdasNeedUploading(
  outDir: string,
  lambdaMTime: number
): Promise<boolean> {
  const outPath = outFilePath(outDir);
  const outStat = await fsp.stat(outPath);
  return lambdaMTime > outStat.mtimeMs;
}
