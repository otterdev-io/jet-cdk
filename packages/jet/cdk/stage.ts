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
import fs from 'fs';
import path from 'path';
import json5 from 'json5';

export class JetStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    stacks: (stage: Stage) => void,
    props?: StageProps
  ) {
    super(scope, id, props);
    this.node.setContext('jet:stage', id);
    stacks(this);
    const stackIds = this.node.children
      .filter((n) => n instanceof Stack)
      .map((n) => n.node.id);
    const outDir = this.node.tryGetContext('jet:out-dir');
    if (outDir) {
      fs.writeFileSync(
        path.join(outDir, `${id}.stage.json5`),
        json5.stringify({ stacks: stackIds })
      );
    }
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
