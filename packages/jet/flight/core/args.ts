import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export type Command = 'dev' | 'deploy' | 'list-stages';

export type Args = {
  command?: Command;
  stage?: string;
  stacks?: string[];
  synthArgs?: string[];
  deployArgs?: string[];
  config?: string;
  outDir?: string;
  projectDir?: string;
};

export async function setupArgs(): Promise<Args> {
  const args = await yargs(hideBin(process.argv))
    .command('dev [stage]', 'Start development mode', (yargs) => {
      return yargs
        .positional('stage', {
          type: 'string',
          description: 'Stage to use for development',
        })
        .option('stacks', {
          type: 'array',
          description: 'Stacks to dev against',
        })
        .option('synth-args', {
          type: 'array',
          description: 'Extra arguments to cdk synth',
        })
        .option('deploy-args', {
          type: 'array',
          description: 'Extra arguments to cdk deploy',
        });
    })
    .command('deploy [stage]', 'Deploy a stage', (yargs) => {
      return yargs
        .positional('stage', {
          type: 'string',
          description: 'Stage to use for development',
        })
        .option('stacks', {
          type: 'array',
          description: 'Stacks to deploy',
        })
        .option('deploy-args', {
          type: 'array',
          description: 'Extra arguments to cdk deploy',
        });
    })
    .command('list-stages', 'List detected stages')
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'Configuration file to read from',
    })
    .option('out-dir', {
      alias: 'o',
      type: 'string',
      description: 'Output directory for jet data [.jet]',
    })
    .option('project-dir', {
      alias: 'p',
      type: 'string',
      description: 'Base directory of the project [.]',
    }).argv;

  return {
    command: args._[0] as Command,
    stage: args.stage,
    stacks: args.stacks as string[],
    synthArgs: args['synth-args'] as string[],
    deployArgs: args['deploy-args'] as string[],
    config: args.config,
    outDir: args['out-dir'],
    projectDir: args['project-dir'],
  };
}
