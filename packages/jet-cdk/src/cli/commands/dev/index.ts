import fsp from "fs/promises";
import { watch } from "chokidar";
import { BaseConfigWithUserAndCommandStage } from "../../../common/config";
import { deployIfNecessary, doDeploy } from "./deploy";
import { lambdasNeedUploading, processLambdas } from "./lambda";
import { emitKeypressEvents } from "readline";
import chalk from "chalk";
import { latestWatchedMtime } from "./files";

/**
 * Dev mode runner. Loops a monitor for files, when one changes,
 * Reuploads lambdas.
 */
export async function runDev(
  config: BaseConfigWithUserAndCommandStage<"dev">,
  configFile: string | undefined
) {
  let tailTimeouts: NodeJS.Timeout[] = [];
  const clearTailTimeouts = () => tailTimeouts.forEach(clearInterval);
  fsp.mkdir(config.outDir, { recursive: true });
  const lambdaWatcher = watch(config.dev.watcher.watch, {
    ignored: config.dev.watcher.ignore,
  });
  const lambdaMTime = await latestWatchedMtime(lambdaWatcher);
  const didDeploy = await deployIfNecessary(config, lambdaMTime, configFile);
  const refreshLambdas = async (doUpload: boolean) => {
    try {
      clearTailTimeouts();
      tailTimeouts = await processLambdas(doUpload, config);
    } catch (e) {
      console.error(chalk.redBright(chalk.bgBlack("Error refreshing lambdas")));
    }
  };

  const uploadRefreshLambdas = () => refreshLambdas(true);
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", async function (ch, key) {
    if (
      (key?.ctrl && key?.name === "c") ||
      (!(key?.ctrl ?? false) && key?.name === "x")
    ) {
      console.info("Exiting");
      process.exit();
    }
    if (!(key?.ctrl ?? false) && key?.name === "d") {
      console.info(chalk.bold(chalk.blue(chalk.bgBlack("Deploying"))));
      process.stdin.pause();
      lambdaWatcher.off("change", uploadRefreshLambdas);
      clearTailTimeouts();
      doDeploy(config, configFile);
      lambdaWatcher.on("change", uploadRefreshLambdas);
      await refreshLambdas(false);
      process.stdin.resume();
    }
  });
  lambdaWatcher.on("change", uploadRefreshLambdas);
  refreshLambdas(
    !didDeploy && (await lambdasNeedUploading(config.outDir, lambdaMTime))
  );
}
