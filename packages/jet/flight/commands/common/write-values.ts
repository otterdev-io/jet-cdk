import chalk from 'chalk';
import fsp from 'fs/promises';
import json5 from 'json5';
import path from 'path';
import * as envFile from 'envfile';
import { getStacks } from './outFile';
import pMap from 'p-map';
import { outFilePath } from '../../core/run-cdk';
export async function writeValues(
  stage: string,
  outDir: string,
  projectDir: string
) {
  const stacks = await getStacks(outFilePath(stage, outDir));
  if (!stacks.size) {
    console.info(chalk.bold('No stacks'));
  }

  await pMap(stacks.values(), async (stack) => {
    if (!stack.jet) {
      console.error(
        'No jet value in stack output. Did you add the jet function to the end?'
      );
      return [];
    }
    if (stack.jet.writeValues) {
      await pMap(stack.jet.writeValues, (wv) => {
        const output =
          wv.format === 'json' || wv.format == null
            ? JSON.stringify(wv.values, undefined, 2)
            : wv.format === 'json5'
            ? json5.stringify(wv.values, undefined, 2)
            : envFile.stringify(wv.values);
        return fsp.writeFile(path.resolve(projectDir, wv.path), output);
      });
    }
  });
}
