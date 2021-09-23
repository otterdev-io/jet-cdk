export interface DeployExecutorSchema {
  'project-dir': string;
  stage?: string;
  config?: string;
  'out-dir'?: string;
  'deploy-args'?: string;
}
