import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import { outFilePath, runCdk } from '../../core/run-cdk';
import {
  LambdaClient,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommandOutput,
} from '@aws-sdk/client-lambda';
import zip from 'jszip';
import fsp from 'fs/promises';
import {
  DeployedFunction,
  ParsedDeployedDevStack,
  SynthedFunction,
} from '../common/types';
import { tailLogs } from './logs';
import { stackFilter } from '../../core/stacks';
import chalk from 'chalk';
import json5 from 'json5';
import { ReInterval } from 'reinterval';
import pMap from 'p-map';

// For given stacks in config, upload all lambdas, then tail their cloudwatch logs
export async function processStacksLambdas(
  doUpload: boolean,
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  stacks: Map<string, ParsedDeployedDevStack>
): Promise<ReInterval[]> {
  if (doUpload) {
    runSynth(config);
  } else {
    console.info(
      chalk.greenBright(chalk.bgBlack('Lambdas appear fresh, skipping upload'))
    );
  }

  const stackFunctions = await getStackFunctions(stacks);

  if (stackFunctions.size === 0) {
    console.info('Redeploy once you have some lambdas');
    return [];
  } else {
    return uploadAndTail(stackFunctions, doUpload);
  }
}

async function uploadAndTail(
  stackFunctions: Map<
    string,
    {
      readonly stackName: string;
      readonly assemblyOutDir: string;
      readonly fn: DeployedFunction;
    }
  >,
  doUpload: boolean
): Promise<ReInterval[]> {
  // Some functions seem to not have a name. Ignore those ones
  const devFunctions = [...stackFunctions.values()].filter(({ fn }) => fn.name);
  const intervals = await pMap(
    devFunctions,
    async ({ stackName, assemblyOutDir, fn }) => {
      try {
        if (doUpload) {
          console.info(`Uploading ${fn.name}`);
          await upload(stackName, assemblyOutDir, fn);
        }
        return [await tailLogs(fn)];
      } catch (e: any) {
        console.warn(chalk.bgBlack(chalk.yellow('Error uploading a lambda:')));
        console.warn(e.message);
        return [];
      }
    },
    { concurrency: 1 }
  );
  return intervals.flatMap((x) => x);
}

async function getStackFunctions(stacks: Map<string, ParsedDeployedDevStack>) {
  return new Map(
    (
      await pMap(stacks.entries(), async ([stackName, stack]) =>
        stack.jet.functions.map(
          (fn) =>
            [
              fn.id,
              {
                stackName: stackName,
                assemblyOutDir: stack.jet.assemblyOutDir,
                fn,
              },
            ] as const
        )
      )
    )
      //Name filter since name not defined popped up once
      // .flatMap((fn) => fn.filter((f) => f[1].fn.name))
      .flatMap((fn) => fn)
  );
}

function runSynth(config: BaseConfigWithUserAndCommandStage<'dev'>) {
  return runCdk('synth', {
    cwd: config.projectDir,
    jetOutDir: config.outDir,
    context: { dev: 'true' },
    args: [
      ...config.dev.synthArgs,
      ...stackFilter(config.dev.stage, config.dev.stacks, {
        user: config.user,
      }),
    ],
  });
}

async function upload(
  stackName: string,
  assemblyOutDir: string,
  fn: DeployedFunction
): Promise<UpdateFunctionConfigurationCommandOutput | null> {
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
): Promise<Uint8Array | null> {
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
  return assetZip.generateAsync({
    type: 'uint8array',
  });
}

async function updateLambda(
  zip: Uint8Array,
  fn: DeployedFunction
): Promise<UpdateFunctionConfigurationCommandOutput> {
  const lambda = new LambdaClient({});
  const response = await lambda.send(
    new UpdateFunctionCodeCommand({
      FunctionName: fn.name,
      ZipFile: zip,
    })
  );
  console.info(response.LastUpdateStatus);
  return response;
}

export async function lambdasNeedUploading(
  stage: string,
  outDir: string,
  lambdaMTime: number
): Promise<boolean> {
  const outPath = outFilePath(stage, outDir);
  const outStat = await fsp.stat(outPath);
  return lambdaMTime > outStat.mtimeMs;
}
