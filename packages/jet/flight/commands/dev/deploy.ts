import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import fsp from 'fs/promises';
import fs from 'fs';
import { outFilePath, runCdk } from '../../core/run-cdk';
import { stacksToDev, stackFilter } from '../../core/stacks';
import chalk from 'chalk';
import cleanDeep from 'clean-deep';
import { writeOutputsFiles } from '../common/write-outputs-files';
import { getDeployedStacks } from '../common/get-deployed-stacks';
import {
  isDeployedDevStack,
  isParsedDeployedDevStack,
  ParsedDeployedDevStack,
} from '../common/types';

/**  Do a deploy if:
 * - Theres no outputs file
 * - outputs file isn't modified as recently as source has been changed
 * - The desired dev stacks arent in the outputs file
 **/
export async function deployIfNecessary(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  lambdaMTime: number,
  configFile: string | undefined
): Promise<boolean> {
  let deploy = false;
  const outPath = outFilePath(config.dev.stage, config.outDir);
  if (!fs.existsSync(outPath)) {
    console.info(
      chalk.bgBlack(chalk.blue('No deployment outputs file exists'))
    );
    deploy = true;
  } else {
    const outStat = await fsp.stat(outPath);
    if (outStat.mtimeMs < lambdaMTime) {
      console.info(
        chalk.bgBlack(chalk.blue('Source file has changed since last deploy'))
      );
      deploy = true;
    }
    //Check that all requested stacks have been deployed
    let deployedDevStackIds: string[] = [];
    try {
      const deployedDevStacks = await getDeployedStacks(outPath);
      deployedDevStackIds = [...deployedDevStacks.values()].flatMap((stack) =>
        stack.jet?.id ? [stack.jet.id] : []
      );
    } catch (e) {
      console.info(
        chalk.bgBlack(chalk.blue('Couldnt open stage outputs file'))
      );
      deploy = true;
    }
    let devStacks: string[] = [];
    try {
      devStacks = await stacksToDev(
        config.dev.stage,
        config.dev.stacks,
        config.outDir
      );
    } catch (e) {
      console.info(chalk.bgBlack(chalk.blue('Couldnt open stacks info file')));
      deploy = true;
    }
    const undeployed = devStacks.filter(
      (stack) => !deployedDevStackIds.includes(stack)
    );
    if (undeployed.length > 0) {
      console.warn(
        `Requested stack(s) ${undeployed.join(', ')} not deployed with dev data`
      );
      deploy = true;
    }
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

/** Run cdk deploy on the stacks provided in config
 *
 * @param config The config to run against
 * @param configFile Path to jet configuration file to pass to cdk
 **/
export function doDeploy(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  configFile: string | undefined
) {
  const outPath = outFilePath(config.dev.stage, config.outDir);
  runCdk('deploy', {
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
      ...stackFilter(config.dev.stage, config.dev.stacks, {
        user: config.user,
      }),
    ],
  });
  writeOutputsFiles(config.dev.stage, config.outDir, config.projectDir);
}
