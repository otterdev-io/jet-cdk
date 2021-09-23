import { Construct, Stage } from '@aws-cdk/core';
import { loadConfig } from '../common/config';

export class JetCoreStack extends Construct {
  constructor(
    scope: Construct,
    id: string,
    stages: Record<string, StageBuilder>
  ) {
    super(scope, id);
    //Add a context override just in case it is so desired
    const configFile = this.node.tryGetContext('jet:config-file');
    loadConfig(configFile).then((config) => {
      Object.entries(stages).forEach(([id, stage]) =>
        stage(this, id.replace('{user}', config.user))
      );
    });
  }
}

export type StageBuilder = (scope: Construct, id: string) => Stage;
