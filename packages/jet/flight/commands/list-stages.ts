import cleanDeep from 'clean-deep';
import { runCdk } from '../core/run-cdk';

/**
 * Return a list of all the stages detected from cdk's list stacks output
 * @param projectDir project directory
 * @param outDir jet output directory
 * @param configFile config file
 * @returns list of stages
 */
export function listStages(
  projectDir: string,
  outDir: string,
  configFile: string | undefined
): string[] {
  const output =
    runCdk('list', {
      jetOutDir: outDir,
      context: cleanDeep({
        'project-dir': projectDir,
        'config-file': configFile,
      }),
      stdio: 'pipe',
      cwd: projectDir,
    }).stdout?.toString() ?? '';

  const matches = output.matchAll(
    /^[a-zA-Z0-9-]+\/([a-zA-Z0-9-/]+)\/[a-zA-Z0-9-]+$/gm
  );
  const stages = [...matches].map((m) => m[1]).filter((x) => x);
  return [...new Set(stages)];
}
