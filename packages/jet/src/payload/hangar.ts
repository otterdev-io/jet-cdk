import {
  Aspects,
  Construct,
  IAspect,
  IConstruct,
  Stack,
  Stage,
  StageProps,
} from '@aws-cdk/core';
import { loadConfig } from '../common/config';
import { jetOutput } from './stack';

export class JetHangar extends Construct {
  constructor(
    scope: Construct,
    id: string,
    stages: Record<
      string,
      | { props?: StageProps; stage: (stage: Stage) => void }
      | ((stage: Stage) => void)
    >
  ) {
    super(scope, id);
    //Add a context override just in case it is so desired
    const configFile = this.node.tryGetContext('jet:config-file');
    loadConfig(configFile).then((config) => {
      Object.entries(stages).forEach(([id, stage]) => {
        if (typeof stage === 'object') {
          new JetStage(
            this,
            id.replace('{user}', config.user),
            stage.stage,
            stage.props
          );
        } else {
          new JetStage(this, id.replace('{user}', config.user), stage);
        }
      });
    });
  }
}

export class JetStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    stacks: (stage: Stage) => void,
    props?: StageProps
  ) {
    super(scope, id, props);
    this.node.setContext('jet:assembly-out-dir', this._assemblyBuilder.outdir);
    stacks(this);
    Aspects.of(this).add(new StackJetter());
  }
}

class StackJetter implements IAspect {
  public visit(node: IConstruct): void {
    // See that we're dealing with a CfnBucket
    if (node instanceof Stack) {
      jetOutput(node);
    }
  }
}
