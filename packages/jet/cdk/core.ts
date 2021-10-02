import { Construct, Stage } from '@aws-cdk/core';
import {
  getUsernameFromOS,
  loadConfig,
  writePersonalConfig,
} from '../common/config';

export class JetCore extends Stage {
  constructor(
    scope: Construct,
    appId: string,
    stages: Record<string, StageBuilder>
  ) {
    super(scope, appId);
    //Add a context override just in case it is so desired
    const projectDir = this.node.tryGetContext('jet:project-dir');
    const configFile = this.node.tryGetContext('jet:config-file');
    let user: string;
    const config = loadConfig(projectDir, configFile);
    if (config.user) {
      user = config.user;
    } else {
      user = getUsernameFromOS();
      writePersonalConfig(user, projectDir);
    }
    Object.entries(stages).forEach(([id, stage]) => {
      stage(this, id.replace('{user}', user));
    });
  }
}

export type StageBuilder = (scope: Construct, id: string) => Stage;

export function getJetStage(scope: Construct) {
  return scope.node.tryGetContext('jet:stage');
}
