export interface Stack {
  jet: string;
}
export interface ParsedStack extends Record<string, any> {
  jet: JetOutput;
}

export interface JetOutput {
  id: string;
  functions: DeployedFunction[];
  assemblyOutDir: string;
  writeValues: WriteValues[];
}

export interface SynthedFunction {
  id: string;
  path: string;
}
export interface DeployedFunction {
  id: string;
  name: string;
}

export interface WriteValues {
  path: string;
  values: Record<string, string>;
  format?: 'json' | 'json5' | 'env';
}
