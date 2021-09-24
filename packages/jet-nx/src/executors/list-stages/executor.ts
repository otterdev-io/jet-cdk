import { ListStagesExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: ListStagesExecutorSchema) {
  try {
    await flight(false, {
      command: 'list-stages',
      projectDir: options['project-dir'],
      config: options.config,
      outDir: options['out-dir'],
    });
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
