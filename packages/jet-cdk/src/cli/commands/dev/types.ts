export interface Stack {
  jet: string;
}

export interface JetOutput {
  functions: DeployedFunction[];
  assemblyOutDir: string;
}

export interface SynthedFunction {
  id: string;
  path: string;
}
export interface DeployedFunction {
  id: string;
  name: string;
}
