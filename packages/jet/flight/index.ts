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

export async function flight(args: Args) {
  const mergedConfig = await getMergedConfig(args);
  //Normalise paths so they're not affected by projectpath
  const configFilePath = args.config ? path.resolve(args.config) : args.config;
  const config = merge<BaseConfigWithUser>(mergedConfig, {
    outDir: path.resolve(mergedConfig.outDir),
  });
  switch (args.command) {
    case 'dev': {
      if (checkDevStage(config, configFilePath)) {
        await runDev(config, configFilePath);
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
      outDir: args.outDir,
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
  return merge<BaseConfigWithUser, typeof argsConfig>(c, argsConfig);
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
  }
  return stageValid;
}
