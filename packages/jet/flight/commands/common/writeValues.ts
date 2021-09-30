import chalk from 'chalk';
import fsp from 'fs/promises';
import json5 from 'json5';
import path from 'path';
import * as envFile from 'envfile';
import { getStacks } from './outFile';
import { JetOutput } from './types';
import pMap from 'p-map';
export async function writeValues(outDir: string, projectDir: string) {
  const stacks = await getStacks(outDir);
  if (!Object.keys(stacks).length) {
    console.info(chalk.bold('No stacks'));
  }

  await pMap(Object.values(stacks), async (stack) => {
    if (!stack.jet) {
      console.error(
        'No jet value in stack output. Did you add the jet function to the end?'
      );
      return [];
    }
    const jetOutput: JetOutput = await JSON.parse(stack.jet);
    await pMap(jetOutput.writeValues, (wv) => {
      const output =
        wv.format === 'json' || wv.format == null
          ? JSON.stringify(wv.values, undefined, 2)
          : wv.format === 'json5'
          ? json5.stringify(wv.values, undefined, 2)
          : envFile.stringify(wv.values);
      return fsp.writeFile(path.resolve(projectDir, wv.path), output);
    });
  });
}
