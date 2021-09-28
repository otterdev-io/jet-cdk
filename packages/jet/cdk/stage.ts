import {
  Aspects,
  Construct,
  IAspect,
  IConstruct,
  Stack,
  Stage,
  StageProps,
} from '@aws-cdk/core';
import { StageBuilder } from './core';
import { jetOutput } from './stack';

export class JetStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    stacks: (stage: Stage) => void,
    props?: StageProps
  ) {
    super(scope, id, props);
    this.node.setContext('jet:assembly-out-dir', this._assemblyBuilder.outdir);
    this.node.setContext('jet:stage', id);
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

export function jetStage(
  stacks: (stage: Stage) => void,
  props?: StageProps
): StageBuilder {
  return (scope, id) => new JetStage(scope, id, stacks, props);
}
