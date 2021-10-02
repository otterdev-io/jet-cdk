import { cosmiconfigSync } from 'cosmiconfig';
import { LoadersSync } from 'cosmiconfig/dist/types';
import json5 from 'json5';
import merge from 'deepmerge';
import fs from 'fs';
import { STS } from '@aws-sdk/client-sts';
import os from 'os';
import path, { dirname } from 'path';

export const DefaultOutDir = '.jet';
export const DefaultUserConfigPath = '.jetrc.json5';
export const DefaultConfigPath = 'jet.config.json5';

export const DefaultConfig = {
  user: undefined as string | undefined,
  outDir: DefaultOutDir,
  dev: {
    stage: undefined as string | undefined,
    stacks: undefined as string[] | undefined,
    watcher: {
      watch: ['lib/**/*'],
      ignore: ['node_modules'],
    },
    synthArgs: [] as string[],
    deployArgs: [] as string[],
  },
  deploy: {
    stage: undefined as string | undefined,
    stacks: undefined as string[] | undefined,
    deployArgs: [] as string[],
  },
  projectDir: '.',
};

export type BaseConfig = typeof DefaultConfig;
export type BaseConfigWithUser = BaseConfig & { user: string };
export type BaseConfigWithUserAndCommandStage<T extends string> =
  BaseConfigWithUser & Record<T, { stage: string }>;

/**
 * Load configuration files. Will attempt to load a personal file and a main file.
 * Main file path can be set, but personal file will always override
 * @param path Path to main file to load
 */
export function loadConfig(
  projectDir: string | undefined,
  configPath: string | undefined
): BaseConfig {
  const loaders: LoadersSync = {
    '.json5': (_path, content) => json5.parse(content),
  };
  const personalResult = cosmiconfigSync('jet', {
    loaders,
    searchPlaces: ['.jetrc.json5', '.jetrc', '.jetrc.json'],
  }).search(projectDir);
  const mainExplorer = cosmiconfigSync('jet', {
    loaders,
    searchPlaces: ['jet.config.json5', 'jet.config.json'],
  });
  const mainResult = configPath
    ? mainExplorer.load(configPath)
    : mainExplorer.search(projectDir);
  return merge.all<BaseConfig>(
    [
      normalizeOutDir(DefaultConfig, projectDir ?? '.'),
      mainResult ? normalizeOutDir(mainResult.config, mainResult.filepath) : {},
      personalResult
        ? normalizeOutDir(personalResult.config, personalResult.filepath)
        : {},
    ],
    {
      arrayMerge: (target, source) => source,
    }
  );
}

/**
 * Take a config (loaded from a file) and make the contained outDir relative to the config
 * @param result
 * @returns
 */
function normalizeOutDir(config: BaseConfig, relativePath: string) {
  return merge(
    config,
    config.outDir
      ? {
          outDir: path.resolve(dirname(relativePath), config.outDir),
        }
      : {}
  );
}

export function writePersonalConfig(
  username: string,
  projectDir: string | undefined
) {
  const userConfig = {
    user: username,
  };
  fs.writeFileSync(
    projectDir
      ? path.join(projectDir, DefaultUserConfigPath)
      : DefaultConfigPath,
    json5.stringify(userConfig, undefined, 2)
  );
}

/**
 * Get the name of the user, first try iam, then if that fails, from os.
 * @returns username
 */
export async function getUsernameFromIAM(): Promise<string | undefined> {
  try {
    const identityArn = (await new STS({}).getCallerIdentity({})).Arn;
    return identityArn ? identityArn.split('/')[1] : undefined;
  } catch (e) {
    console.warn(`AWS Error: ${(e as Error).message}\n`);
    console.warn('Unable to read IAM identity.');
  }
}

export function getUsernameFromOS(): string {
  return os.userInfo().username;
}
