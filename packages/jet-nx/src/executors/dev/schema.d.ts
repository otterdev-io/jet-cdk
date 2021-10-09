export interface DevExecutorSchema {
  'project-dir': string;
  stage?: string;
  stacks?: string[];
  config?: string;
  'out-dir'?: string;
  'cdk-args'?: string;
}
