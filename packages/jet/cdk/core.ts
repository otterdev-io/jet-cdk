import { Construct, Stack, Stage } from '@aws-cdk/core';
import {
  getUsernameFromOS,
  loadConfig,
  writePersonalConfig,
} from '../common/config';

export class JetCore<S extends Record<string, StageBuilder>> extends Stack {
  public stages: Record<keyof S, Stage>;
  constructor(scope: Construct, appId: string, stages: S) {
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
    this.stages = {} as Record<keyof S, Stage>;
    Object.entries(stages).forEach(([id, stage]) => {
      this.stages[id as keyof S] = stage(this, id.replace('{user}', user));
    });
  }
}

export type StageBuilder = (scope: Construct, id: string) => Stage;

export function getJetStage(scope: Construct) {
  return scope.node.tryGetContext('jet:stage');
}
