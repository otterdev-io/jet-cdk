// Normal deployed stack info might not have jet, if it has no output files
export interface DeployedStack {
  jet?: string;
}
// Normal deployed stack info might not have jet, if it has no output files
export interface ParsedDeployedStack extends Record<string, any> {
  jet?: JetOutput;
}

export interface DeployedDevStack extends DeployedStack {
  jet: string;
}
export interface ParsedDeployedDevStack extends ParsedDeployedStack {
  jet: JetOutput;
}

export function isDeployedDevStack(
  stack: DeployedStack
): stack is DeployedDevStack {
  return stack.jet ? true : false;
}
export function isParsedDeployedDevStack(
  stack: ParsedDeployedStack
): stack is ParsedDeployedDevStack {
  return stack.jet?.id ? true : false;
}
export interface JetOutput {
  id: string;
  functions: DeployedFunction[];
  assemblyOutDir: string;
  outputsFiles: OutputsFile[];
}

export interface SynthedFunction {
  id: string;
  path: string;
}
export interface DeployedFunction {
  id: string;
  name: string;
}

export type OutputsFile = {
  path: string;
} & (
  | {
      contents: Record<string, unknown>;
      format?: 'json' | 'json5';
    }
  | {
      contents: Record<string, string>;
      format: 'env';
    }
);
