import chalk from 'chalk';
import fsp from 'fs/promises';
import json5 from 'json5';
import path from 'path';
import * as envFile from 'envfile';
import { getDeployedStacks } from './get-deployed-stacks';
import pMap from 'p-map';
import { outFilePath } from '../../core/run-cdk';
export async function writeOutputsFiles(
  stage: string,
  outDir: string,
  projectDir: string
) {
  const stacks = await getDeployedStacks(outFilePath(stage, outDir));
  if (!stacks.size) {
    console.info(chalk.bold('No stacks'));
  }

  await pMap(stacks.values(), async (stack) => {
    // If we deploy and have no outputs
    if (!stack.jet) {
      return [];
    }
    await pMap(stack.jet.outputsFiles, (of) => {
      const output =
        of.format === 'json' || of.format == null
          ? JSON.stringify(of.contents, undefined, 2)
          : of.format === 'json5'
          ? json5.stringify(of.contents, undefined, 2)
          : envFile.stringify(of.contents);
      return fsp.writeFile(path.resolve(projectDir, of.path), output);
    });
  });
}
