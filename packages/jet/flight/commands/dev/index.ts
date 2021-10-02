import fsp from 'fs/promises';
import { watch } from 'chokidar';
import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import { deployIfNecessary, doDeploy } from './deploy';
import {
  lambdasNeedUploading,
  processStacksLambdas,
} from './process-stacks-lambdas';
import { emitKeypressEvents } from 'readline';
import chalk from 'chalk';
import { latestWatchedMtime } from './files';
import { ReInterval } from 'reinterval';
import { usagePrompt } from './prompt';
import { getStacks } from '../common/outFile';
import { ParsedStack } from '../common/types';
import { outFilePath } from '../../core/run-cdk';

/**
 * Dev mode runner. Loops a monitor for files, when one changes,
 * Reuploads lambdas.
 * @param standalone Whether this is running as a standalone
 * @param config Framework configuration
 * @param configFile Path to the config file, for passing to cdk
 */
export async function runDev(
  standalone: boolean,
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  configFile: string | undefined
) {
  let exit: () => void;
  let tailTimeouts: ReInterval[] = [];
  const clearTailTimeouts = () => {
    tailTimeouts.forEach((t) => t.destroy());
  };
  fsp.mkdir(config.outDir, { recursive: true });

  // Our watcher that monitors for changes to any files, in order to re-upload lambdas
  const lambdaWatcher = watch(config.dev.watcher.watch, {
    ignored: config.dev.watcher.ignore,
    cwd: config.projectDir,
  });

  // Do an initial deploy if files have changed since last deploy
  const lambdaMTime = await latestWatchedMtime(lambdaWatcher);
  const didDeploy = await deployIfNecessary(config, lambdaMTime, configFile);

  const stackOutputsPath = outFilePath(config.dev.stage, config.outDir);
  const allStacks = await getStacks(stackOutputsPath);
  const stacks = filterStacks(config, allStacks);
  printStackOutputs(stacks);
  // Re-process lambdas, possibly uploading, then tailing logs
  const refreshLambdas = async (doUpload: boolean) => {
    try {
      clearTailTimeouts();
      tailTimeouts = await processStacksLambdas(doUpload, config, stacks);
      //Touch output file, so that we won't need to redeploy on re-launchbased on these changes
      await fsp.utimes(stackOutputsPath, new Date(), new Date());
      usagePrompt();
    } catch (e) {
      console.error(e);
      console.error(chalk.redBright(chalk.bgBlack('Error refreshing lambdas')));
    }
  };
  const uploadRefreshLambdas = () => refreshLambdas(true);
  lambdaWatcher.on('change', uploadRefreshLambdas);
  await refreshLambdas(
    !didDeploy &&
      (await lambdasNeedUploading(config.dev.stage, config.outDir, lambdaMTime))
  );

  //Handle pressing 'ctrl-c' or 'x' to exit, and 'd' to deploy
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  const onKeypress = async function (ch: any, key: any) {
    if (
      (key?.ctrl && key?.name === 'c') ||
      (!(key?.ctrl ?? false) && key?.name === 'x')
    ) {
      console.info('Exiting');
      exit();
    }
    if (!(key?.ctrl ?? false) && key?.name === 'd') {
      console.info(chalk.bold(chalk.blue(chalk.bgBlack('Deploying'))));
      process.stdin.pause();
      lambdaWatcher.off('change', uploadRefreshLambdas);
      clearTailTimeouts();
      doDeploy(config, configFile);
      lambdaWatcher.on('change', uploadRefreshLambdas);
      await refreshLambdas(false);
      process.stdin.resume();
    }
  };
  process.stdin.on('keypress', onKeypress);

  //Wait for magic key before exiting
  await new Promise<void>((resolve) => {
    exit = () => {
      // For some reason can't get it to autmatically exit just by cleaning up
      if (standalone) {
        process.exit(0);
      } else {
        process.stdin.off('keypress', onKeypress);
        lambdaWatcher.off('change', uploadRefreshLambdas);
        lambdaWatcher.close();
        clearTailTimeouts();
        process.stdin.setRawMode(false);
        resolve();
      }
    };
  });
}

//Return the stacks specified in config, out of allStacks
function filterStacks(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  allStacks: Map<string, ParsedStack>
) {
  return config.dev.stacks
    ? new Map(
        [...allStacks.entries()].filter(([name, stack]) =>
          config.dev.stacks?.includes(stack.jet.id)
        )
      )
    : allStacks;
}

// Print the cfn outputs of the given stacks, hiding jet
function printStackOutputs(stacks: Map<string, ParsedStack>) {
  stacks.forEach((stack, stackName) => {
    console.log();
    console.info(chalk.bold(stackName));
    console.info(chalk.bold('Stack outputs (jet hidden):'));
    const { jet, ...rest } = stack;
    Object.entries(rest).forEach(([key, value]) => {
      console.info(chalk.blueBright(chalk.bgBlack(`${key}: ${value}`)));
    });
    console.log();
  });
}
