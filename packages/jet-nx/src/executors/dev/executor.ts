import { DevExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet';

export default async function runExecutor(options: DevExecutorSchema) {
  console.log('Executor ran for Build', options);
  flight.main({
    command: 'dev',
    stage: options.stage,
    config: options.config,
    outDir: options['out-dir'],
    synthArgs: options['synth-args']?.split(' '),
    deployArgs: options['deploy-args']?.split(' '),
  });
  return {
    success: true,
  };
}
