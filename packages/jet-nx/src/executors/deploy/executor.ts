import { DeployExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: DeployExecutorSchema) {
  try {
    await flight(false, {
      command: 'dev',
      projectDir: options['project-dir'],
      stage: options.stage,
      config: options.config,
      outDir: options['out-dir'],
      deployArgs: options['deploy-args']?.split(' '),
    });
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
    };
  }
}
