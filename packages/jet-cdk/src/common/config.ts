import { cosmiconfig, cosmiconfigSync } from "cosmiconfig";
import { LoadersSync } from "cosmiconfig/dist/types";
import json5 from "json5";
import merge from "deepmerge";
import fs from "fs/promises";
import { STS } from "@aws-sdk/client-sts";
import os from "os";

export const DefaultConfig = {
  user: undefined as string | undefined,
  outDir: ".jet",
  dev: {
    stage: undefined as string | undefined,
    watcher: {
      watch: ["lib/**/*"],
      ignore: ["node_modules"],
    },
    synthArgs: ["-q"],
    deployArgs: [] as string[],
  },
  deploy: {
    stage: undefined as string | undefined,
    deployArgs: [] as string[],
  },
};

export const DefaultUserConfigPath = ".jetrc.json5";
export const DefaultConfigPath = "jet.config.json5";

export type BaseConfig = typeof DefaultConfig;
export type BaseConfigWithUser = BaseConfig & { user: string };
export type BaseConfigWithUserAndCommandStage<T extends string> =
  BaseConfigWithUser & Record<T, { stage: string }>;

/**
 * Load configuration files. Will attempt to load a personal file and a main file.
 * Main file path can be set, but personal file will always override
 * @param path Path to main file to load
 */
export async function loadConfig(
  path: string | undefined
): Promise<BaseConfigWithUser> {
  const loaders: LoadersSync = {
    ".json5": (_path, content) => json5.parse(content),
  };
  const personalResult = await cosmiconfig("jet", {
    loaders,
    searchPlaces: [".jetrc.json5", ".jetrc", ".jetrc.json"],
  }).search();
  const mainExplorer = cosmiconfig("jet", {
    loaders,
    searchPlaces: ["jetrc.json5", "jetrc.json"],
  });
  const mainResult = await (path
    ? mainExplorer.load(path)
    : mainExplorer.search());
  const result = merge.all<BaseConfig>([
    DefaultConfig,
    mainResult?.config ?? {},
    personalResult?.config ?? {},
  ]);
  return checkUser(result, path);
}

export async function checkUser(
  config: BaseConfig,
  path: string | undefined
): Promise<BaseConfigWithUser> {
  if (!config.user) {
    console.log(
      "No user detected in config. Creating a personal config using IAM or OS username."
    );
    const username = await getUserName();
    const userConfig = {
      user: username,
    };
    await fs.writeFile(
      path ?? DefaultUserConfigPath,
      json5.stringify(userConfig, undefined, 2)
    );
    return merge<BaseConfig, typeof userConfig>(config, userConfig);
  }
  return config as BaseConfigWithUser;
}

/**
 * Get the name of the user, first try iam, then if that fails, from os.
 * @returns username
 */
async function getUserName(): Promise<string> {
  let identityArn: string | undefined;
  try {
    identityArn = (await new STS({}).getCallerIdentity({})).Arn;
  } catch (e) {
    console.warn(`AWS Error: ${(e as Error).message}\n`);
    console.warn("Unable to read IAM identity. Falling back to OS username.");
  }
  const iamUser = identityArn ? identityArn.split("/")[1] : undefined;
  return iamUser ?? os.userInfo().username;
}
