import { BaseConfigWithUserAndCommandStage } from '../../../common/config';
import { outFilePath, runCdk } from '../../core/run-cdk';
import { stackFilter } from '../../core/stacks';
import cleanDeep from 'clean-deep';
import { writeOutputsFiles } from '../common/write-outputs-files';

/** Run cdk deploy on the stacks provided in config
 *
 * @param config The config to run against
 * @param configFile Path to jet configuration file to pass to cdk
 **/
export function doDeploy(
  config: BaseConfigWithUserAndCommandStage<'dev'>,
  configFile: string | undefined
) {
  const outPath = outFilePath(config.dev.stage, config.outDir);
  runCdk('deploy', {
    cwd: config.projectDir,
    jetOutDir: config.outDir,
    context: cleanDeep({
      dev: 'true',
      'project-dir': config.projectDir,
      'config-file': configFile,
    }),
    args: [
      '--hotswap',
      '-O',
      outPath,
      ...config.dev.cdkArgs,
      ...stackFilter(config.dev.stage, config.dev.stacks, {
        user: config.user,
      }),
    ],
  });
  writeOutputsFiles(config.dev.stage, config.outDir, config.projectDir);
}
