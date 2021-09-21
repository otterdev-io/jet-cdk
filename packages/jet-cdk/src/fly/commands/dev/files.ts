import { FSWatcher } from "chokidar";
import path from "path";
import fsp from "fs/promises";
export async function latestWatchedMtime(watcher: FSWatcher) {
  return await new Promise<number>((resolve) => {
    watcher.on("ready", async () => {
      const watched = watcher.getWatched();
      const mtimes = await Promise.all(
        Object.entries(watched).map(
          async ([dir, files]) =>
            await Promise.all(
              files.map(async (file) => {
                try {
                  const stat = await fsp.stat(`${dir}${path.sep}${file}`);
                  return stat.mtimeMs;
                } catch (e) {
                  return 0;
                }
              })
            )
        )
      );
      resolve(Math.max(...mtimes.flatMap((t) => t)));
    });
  });
}
