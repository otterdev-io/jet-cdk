import { ListStagesExecutorSchema } from './schema';
import { flight } from '@jet-cdk/jet/flight';

export default async function runExecutor(options: ListStagesExecutorSchema) {
  try {
    await flight({
      command: 'list-stages',
      config: options.config,
      outDir: options['out-dir'],
    });
    return {
      success: true,
    };
  } catch (e) {
    return { success: false };
  }
}
