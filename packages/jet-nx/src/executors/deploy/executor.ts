import { DeployExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: DeployExecutorSchema) {
  try {
    await flight({
      command: 'dev',
      stage: options.stage,
      config: options.config,
      outDir: options['out-dir'],
      deployArgs: options['deploy-args']?.split(' '),
    });
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
    };
  }
}
