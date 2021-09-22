import { runCdk } from '../core/run-cdk';

export function listStages(outDir: string, configFile: string | undefined) {
  return runCdk('list', {
    jetOutDir: outDir,
    context: { 'config-file': configFile },
    stdio: 'pipe',
  })
    .stdout.toString()
    .trim()
    .split('\n')
    .map((s) => s.match(/.+\/(.+)\/.+/)?.[1]);
}
