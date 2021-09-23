import cleanDeep from 'clean-deep';
import { BaseConfigWithUserAndCommandStage } from '../../common/config';
import { stackFilter } from '../core/config';
import { runCdk } from '../core/run-cdk';

export function runDeploy(
  config: BaseConfigWithUserAndCommandStage<'deploy'>,
  configFile: string | undefined
) {
  return runCdk('deploy', {
    jetOutDir: config.outDir,
    context: cleanDeep({ 'config-file': configFile }),
    args: [
      ...config.deploy.deployArgs,
      stackFilter(config.deploy.stage, { user: config.user }),
    ],
  });
}
