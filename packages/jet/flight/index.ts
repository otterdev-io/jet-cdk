import {
  BaseConfigWithUser,
  BaseConfigWithUserAndCommandStage,
  loadConfig,
} from '../common/config';
import { Args } from './core/args';
import merge from 'deepmerge';
import cleanDeep from 'clean-deep';
import chalk from 'chalk';
import { listStages } from './commands/list-stages';
import { runDev } from './commands/dev';
import { runDeploy } from './commands/deploy';
import path from 'path';

/**
 * Main entry point to jet run
 * @param standalone Used as standalone cli, or as a library. Needed because I couldn't figure out clean exit
 * @param args Options to run with
 */
export async function flight(standalone: boolean, args: Args) {
  const config = await getMergedConfig(args);
  //Normalise paths so they're not affected by projectpath
  const configFilePath = args.config ? path.resolve(args.config) : args.config;
  switch (args.command) {
    case 'dev': {
      if (checkDevStage(config, configFilePath)) {
        await runDev(standalone, config, configFilePath);
      }
      break;
    }
    case 'deploy': {
      if (checkDeployStage(config, configFilePath)) {
        runDeploy(config, configFilePath);
      }
      break;
    }
    case 'list-stages': {
      const stages = listStages(
        config.projectDir,
        config.outDir,
        configFilePath
      );
      console.info(
        chalk.yellowBright(
          chalk.bgBlack(chalk.bold('Stages detected from cdk:'))
        )
      );
      stages.forEach((s) => {
        console.info(s);
      });
      break;
    }
  }
}

/**
 * Combine config with args into a final config, and verify the stage
 * @param args
 * @returns
 */
async function getMergedConfig(args: Args): Promise<BaseConfigWithUser> {
  const c = await loadConfig(args.projectDir, args.config);
  //The deep clean is important to make sure we dont overwrite values from the config with unset args
  const argsConfig = cleanDeep(
    {
      //Resolve outdir to an absolute path if it exists, so it isnt affected by projectDir as cwd
      outDir: args.outDir ? path.resolve(args.outDir) : undefined,
      projectDir: args.projectDir,
      dev: {
        stage: args.stage,
        synthArgs: args.synthArgs,
        deployArgs: args.deployArgs,
      },
      deploy: {
        stage: args.stage,
        deployArgs: args.deployArgs,
      },
    },
    { undefinedValues: true }
  );
  const mergedConfig = merge<BaseConfigWithUser, typeof argsConfig>(
    c,
    argsConfig
  );
  //Substitute user back into our stages
  return merge(mergedConfig, {
    dev: {
      stage: mergedConfig.dev.stage?.replace('{user}', mergedConfig.user),
    },
    deploy: {
      stage: mergedConfig.deploy.stage?.replace('{user}', mergedConfig.user),
    },
  });
}

function checkDevStage(
  config: BaseConfigWithUser,
  configFilePath: string | undefined
): config is BaseConfigWithUserAndCommandStage<'dev'> {
  return verifyStage(config, config.dev.stage, configFilePath);
}

function checkDeployStage(
  config: BaseConfigWithUser,
  configFilePath: string | undefined
): config is BaseConfigWithUserAndCommandStage<'deploy'> {
  return verifyStage(config, config.deploy.stage, configFilePath);
}

/**
 * Ensure that the stage that has been configured is actually available
 * @param config loaded and merged configuration
 * @param stage the specified stage
 * @param configFilePath The path to the config file
 * @returns
 */
function verifyStage(
  config: BaseConfigWithUser,
  stage: string | undefined,
  configFilePath: string | undefined
): boolean {
  const stages = listStages(config.projectDir, config.outDir, configFilePath);
  let stageValid = true;
  if (!stage) {
    stageValid = false;
    console.error(
      chalk.redBright(
        chalk.bgBlack('No stage has been provided, from config or argument.')
      )
    );
    console.info('You may:');
    console.info('- Add stage to your configuration file');
    console.info('- Provide stage as an argument');
  }
  if (stage && !stages.includes(stage)) {
    stageValid = false;
    console.error(
      chalk.redBright(chalk.bgBlack(`Stage ${stage} isn't valid for this app!`))
    );
  }
  if (!stageValid) {
    console.info(
      chalk.yellowBright(chalk.bgBlack(chalk.bold('\nAvailable stages:')))
    );
    stages.forEach((s) => {
      console.info(s);
    });
  } else {
    console.info(
      chalk.whiteBright(
        chalk.bgBlack(
          chalk.bold(`Jet taking off on stage: ${chalk.blueBright(stage)}`)
        )
      )
    );
  }
  return stageValid;
}
