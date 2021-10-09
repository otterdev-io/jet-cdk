import fsp from 'fs/promises';
import { watch } from 'chokidar';
import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import { doDeploy } from './deploy';
import { startLoggingLambdas } from './start-logging-lambdas';
import { emitKeypressEvents } from 'readline';
import chalk from 'chalk';
import { ReInterval } from 'reinterval';
import { usagePrompt } from './prompt';
import { getDeployedDevStacks } from '../common/get-deployed-stacks';
import { outFilePath } from '../../core/run-cdk';
import { stacksToDev } from '../../core/stacks';
import { ParsedDeployedDevStack } from '../common/types';

/**
 * Dev mode runner. Loops a monitor for files, when one changes,
 * Reuploads lambdas.
 * @param standalone Whethe this is running as a standalone
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
  const fileWatcher = watch(config.dev.watcher.watch, {
    ignored: config.dev.watcher.ignore,
    cwd: config.projectDir,
  });

  const stackOutputsPath = outFilePath(config.dev.stage, config.outDir);
  const allStacks = await getDeployedDevStacks(stackOutputsPath);
  const devStacks = await stacksToDev(
    config.dev.stage,
    config.dev.stacks,
    config.outDir
  );
  const stacks = filterStacks(devStacks, allStacks);
  printStackOutputs(stacks);
  // Do a deploy then log lambda output
  const deployAndLog = async () => {
    try {
      console.info(chalk.bold(chalk.blue(chalk.bgBlack('Deploying'))));
      process.stdin.pause();
      fileWatcher.off('change', deployAndLog);
      clearTailTimeouts();
      doDeploy(config, configFile);
      tailTimeouts = await startLoggingLambdas(stacks);
      usagePrompt();
      fileWatcher.on('change', deployAndLog);
      process.stdin.resume();
    } catch (e) {
      console.error(e);
      console.error(chalk.redBright(chalk.bgBlack('Error refreshing lambdas')));
    }
  };
  await deployAndLog();

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
      deployAndLog();
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
        fileWatcher.off('change', deployAndLog);
        fileWatcher.close();
        clearTailTimeouts();
        process.stdin.setRawMode(false);
        resolve();
      }
    };
  });
}

//Return the stacks specified in config, out of allStacks
function filterStacks(
  stacks: string[],
  allStacks: Map<string, ParsedDeployedDevStack>
) {
  return new Map(
    [...allStacks.entries()].filter(([name, stack]) =>
      stacks.includes(stack.jet.id)
    )
  );
}

// Print the cfn outputs of the given stacks, hiding jet
function printStackOutputs(stacks: Map<string, ParsedDeployedDevStack>) {
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
