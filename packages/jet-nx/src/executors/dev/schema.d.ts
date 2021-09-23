export interface DevExecutorSchema {
  'project-dir': string;
  stage?: string;
  config?: string;
  'out-dir'?: string;
  'synth-args'?: string;
  'deploy-args'?: string;
}
