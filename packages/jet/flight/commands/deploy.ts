import cleanDeep from 'clean-deep';
import { BaseConfigWithUserAndCommandStage } from '../../common/config';
import { stackFilter } from '../core/stacks';
import { outFilePath, runCdk } from '../core/run-cdk';
import { writeOutputsFiles } from './common/write-outputs-files';

export async function runDeploy(
  config: BaseConfigWithUserAndCommandStage<'deploy'>,
  configFile: string | undefined
) {
  const outPath = outFilePath(config.deploy.stage, config.outDir);
  runCdk('deploy', {
    jetOutDir: config.outDir,
    cwd: config.projectDir,
    context: cleanDeep({
      'project-dir': config.projectDir,
      'config-file': configFile,
    }),
    args: [
      '-O',
      outPath,
      ...config.deploy.deployArgs,
      ...stackFilter(config.deploy.stage, config.deploy.stacks, {
        user: config.user,
      }),
    ],
  });
  await writeOutputsFiles(
    config.deploy.stage,
    config.outDir,
    config.projectDir
  );
}
