import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import fsp from 'fs/promises';
import fs from 'fs';
import { exit } from 'process';
import { outFilePath, runCdk } from '../../core/run-cdk';
import { stackFilter } from '../../core/config';
import { Stack } from './types';
import chalk from 'chalk';
import cleanDeep from 'clean-deep';

export async function deployIfNecessary(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  lambaMTime: number,
  configFile: string | undefined
): Promise<boolean> {
  let deploy = false;
  const outPath = outFilePath(config.outDir);
  try {
    if (!fs.existsSync(outPath)) {
      console.info('No deployment outputs file exists');
      deploy = true;
    } else {
      const outStat = await fsp.stat(outPath);
      if (outStat.mtimeMs < lambaMTime) {
        console.info('Source file has changed since last deploy');
        deploy = true;
      }
      const file = await fsp.readFile(outPath);
      const stacks: Record<string, Stack> = JSON.parse(file.toString());
      if (!Object.keys(stacks).length) {
        console.warn('Outputs file has no stacks');
        deploy = true;
      }
    }
  } catch (e) {
    console.error(`Error statting ${outFilePath}, giving up`);
    exit(0);
  }
  if (deploy) {
    doDeploy(config, configFile);
  } else {
    console.info(
      chalk.greenBright(
        chalk.bgBlack('Outputs file up to date, skipping initial deploy')
      )
    );
  }
  return deploy;
}

export function doDeploy(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  configFile: string | undefined
) {
  const outPath = outFilePath(config.outDir);
  return runCdk('deploy', {
    cwd: config.projectDir,
    jetOutDir: config.outDir,
    context: cleanDeep({
      dev: 'true',
      'project-dir': config.projectDir,
      'config-file': configFile,
    }),
    args: [
      '-O',
      outPath,
      ...config.dev.deployArgs,
      stackFilter(config.dev.stage, { user: config.user }),
    ],
  });
}
