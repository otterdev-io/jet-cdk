import { FSWatcher } from 'chokidar';
import path from 'path';
import fsp from 'fs/promises';
import chalk from 'chalk';
import pMap from 'p-map';
export async function latestWatchedMtime(watcher: FSWatcher) {
  return await new Promise<number>((resolve) => {
    console.info('Waiting for file watcher to ready up...');
    watcher.on('ready', async () => {
      const watched = watcher.getWatched();
      const mtimes = await pMap(
        Object.entries(watched),
        async ([dir, files]) =>
          await Promise.all(
            files.map(async (file) => {
              try {
                const stat = await fsp.stat(
                  path.join(watcher.options.cwd ?? '.', dir, file)
                );
                return stat.mtimeMs;
              } catch (e) {
                console.error(
                  chalk.yellow(chalk.bgBlack('Error statting file'))
                );
                console.error(chalk.yellow(chalk.bgBlack(e)));
                return 0;
              }
            })
          )
      );
      resolve(Math.max(...mtimes.flatMap((t) => t)));
    });
  });
}
