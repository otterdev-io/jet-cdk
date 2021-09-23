import { DevExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: DevExecutorSchema) {
  try {
    await flight({
      command: 'dev',
      projectDir: options['project-dir'],
      stage: options.stage,
      config: options.config,
      outDir: options['out-dir'],
      synthArgs: options['synth-args']?.split(' '),
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
