import { DevExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: DevExecutorSchema) {
  try {
    await flight(false, {
      command: 'dev',
      projectDir: options['project-dir'],
      stage: options.stage,
      stacks: options.stacks,
      config: options.config,
      outDir: options['out-dir'],
      cdkArgs: options['cdk-args']?.split(' '),
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
