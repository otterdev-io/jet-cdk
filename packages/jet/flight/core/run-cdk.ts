import chalk from 'chalk';
import child_process from 'child_process';
import npmRunPath from 'npm-run-path';
import path from 'path';

export function runCdk(
  command: string,
  pars: {
    jetOutDir: string;
    context?: Record<string, string | undefined>;
    args?: string[];
    cwd?: string;
    stdio?: child_process.StdioOptions;
  }
) {
  const contextArr = Object.entries(pars.context ?? {}).flatMap(([k, v]) => [
    '-c',
    `jet:${k}=${v}`,
  ]);
  const result = child_process.spawnSync(
    'cdk',
    [
      command,
      ...contextArr,
      '-o',
      `${pars.jetOutDir}/cdk.out`,
      ...(pars.args ?? []),
    ],
    {
      cwd: pars.cwd,
      //The ternary is necessary due to the nature of npmRunPath's property overwriting
      env: npmRunPath.env(pars.cwd ? { cwd: pars.cwd } : undefined),
      stdio: pars.stdio ?? 'inherit',
    }
  );
  if (result.status) {
    console.error(result);
    console.error(
      chalk.redBright(chalk.bgBlack('Problem running cdk, ejecting!'))
    );
    process.exit(1);
  }
  return result;
}

export function outFilePath(outDir: string) {
  return path.join(outDir, 'cdk-outputs.json');
}
