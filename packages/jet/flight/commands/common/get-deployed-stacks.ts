import {
  DeployedDevStack,
  DeployedStack,
  isDeployedDevStack,
  JetOutput,
  ParsedDeployedDevStack,
  ParsedDeployedStack,
} from './types';
import fsp from 'fs/promises';
import pMap from 'p-map';

/**
 * Read stack data from cdk stage outputs file
 * @param outFilePath Path to the outputs file
 * @returns Stack info
 */
export async function getDeployedStacks(
  outFilePath: string
): Promise<Map<string, ParsedDeployedStack>> {
  const outputsFile = await fsp.readFile(outFilePath, 'utf-8');
  const stacks: Record<string, DeployedStack> = await JSON.parse(outputsFile);
  const parsedStacks = await pMap(
    Object.entries(stacks),
    async ([stackName, stack]) => {
      if (stack.jet) {
        const jetOutput: JetOutput = await JSON.parse(stack.jet);
        return [stackName, { ...stack, jet: jetOutput }] as const;
      } else {
        return [stackName, stack as ParsedDeployedStack] as const;
      }
    }
  );
  return new Map(parsedStacks);
}

/**
 * Like getDeployedStacks, but asserts that jet output property exists, since we forced a deploy
 * @param outFilePath
 * @returns
 */
export async function getDeployedDevStacks(
  outFilePath: string
): Promise<Map<string, ParsedDeployedDevStack>> {
  const outputsFile = await fsp.readFile(outFilePath, 'utf-8');
  const stacks: Record<string, DeployedStack> = await JSON.parse(outputsFile);
  Object.values(stacks).forEach((stack) => {
    if (!isDeployedDevStack(stack)) {
      throw new Error(
        'jet property is missing on stacks, something went wrong'
      );
    }
  });
  const parsedStacks = await pMap(
    Object.entries(stacks as unknown as DeployedDevStack),
    async ([stackName, stack]) => {
      const jetOutput: JetOutput = await JSON.parse(stack.jet);
      return [
        stackName,
        { ...stack, jet: jetOutput } as ParsedDeployedDevStack,
      ] as const;
    }
  );
  return new Map(parsedStacks);
}
