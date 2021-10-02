import fsp from 'fs/promises';
import json5 from 'json5';
import path from 'path';
export const stackFilter = (
  stage: string,
  stacks: string[] | undefined,
  props: { user: string }
): string[] =>
  (stacks ?? ['*']).map(
    (stack) => `*/${stage.replace('{user}', props.user)}/${stack}`
  );

/**
 * return all the stacks listed in the stage info file
 * @param stage
 * @param outDir
 */
async function getAllStageStacks(
  stage: string,
  outDir: string
): Promise<string[]> {
  const infoFile = await fsp.readFile(
    path.join(outDir, `${stage}.stage.json5`)
  );
  const stageData = json5.parse(infoFile.toString());
  return stageData.stacks;
}

// All stacks to dev for the stage, expanding out wildcard *
export async function stacksToDev(
  stage: string,
  stacksFromConfig: string[] | undefined,
  outDir: string
): Promise<string[]> {
  const stageStacks = await getAllStageStacks(stage, outDir);
  if (stacksFromConfig?.includes('*')) {
    return stageStacks;
  } else {
    return stacksFromConfig ?? stageStacks;
  }
}
