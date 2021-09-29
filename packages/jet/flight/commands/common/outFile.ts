import { Stack } from './types';
import fsp from 'fs/promises';
import { outFilePath } from '../../core/run-cdk';
import chalk from 'chalk';

export async function getStacks(
  outDir: string
): Promise<Record<string, Stack>> {
  try {
    const outputsFile = await fsp.readFile(outFilePath(outDir), 'utf-8');
    return JSON.parse(outputsFile);
  } catch (e) {
    console.error(chalk.bgBlack(chalk.red(e)));
    return {};
  }
}
