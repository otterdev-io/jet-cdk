import { DevExecutorSchema } from './schema';
import { main } from 'jet-cdk/fly';

export default async function runExecutor(options: DevExecutorSchema) {
  console.log('Executor ran for Build', options);
  main({
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
