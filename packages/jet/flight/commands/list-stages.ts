import cleanDeep from 'clean-deep';
import { runCdk } from '../core/run-cdk';

export function listStages(outDir: string, configFile: string | undefined) {
  return runCdk('list', {
    jetOutDir: outDir,
    context: cleanDeep({ 'config-file': configFile }),
    stdio: 'pipe',
  })
    .stdout.toString()
    .trim()
    .split('\n')
    .map((s) => s.match(/.+\/(.+)\/.+/)?.[1]);
}
