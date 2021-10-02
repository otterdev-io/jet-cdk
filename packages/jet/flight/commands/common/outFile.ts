import { JetOutput, ParsedStack, Stack } from './types';
import fsp from 'fs/promises';
import chalk from 'chalk';
import pMap from 'p-map';

/**
 * Read stack data from cdk stage outputs file
 * @param outFilePath Path to the outputs file
 * @returns Stack info
 */
export async function getStacks(
  outFilePath: string
): Promise<Map<string, ParsedStack>> {
  const outputsFile = await fsp.readFile(outFilePath, 'utf-8');
  const stacks: Record<string, Stack> = await JSON.parse(outputsFile);
  const parsedStacks = await pMap(
    Object.entries(stacks),
    async ([stackName, stack]) => {
      const jetOutput: JetOutput = await JSON.parse(stack.jet);
      return [stackName, { ...stack, jet: jetOutput }] as const;
    }
  );
  return new Map(parsedStacks);
}
