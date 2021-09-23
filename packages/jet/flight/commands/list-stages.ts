import cleanDeep from 'clean-deep';
import { runCdk } from '../core/run-cdk';

export function listStages(
  projectDir: string,
  outDir: string,
  configFile: string | undefined
) {
  return runCdk('list', {
    jetOutDir: outDir,
    context: cleanDeep({
      'project-dir': projectDir,
      'config-file': configFile,
    }),
    stdio: 'pipe',
    cwd: projectDir,
  })
    .stdout.toString()
    .trim()
    .split('\n')
    .map((s) => s.match(/.+\/(.+)\/.+/)?.[1]);
}
