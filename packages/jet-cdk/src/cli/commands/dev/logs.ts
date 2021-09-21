import { CloudWatchLogs } from "@aws-sdk/client-cloudwatch-logs";
import { usagePrompt } from "./prompt";
import { DeployedFunction } from "./types";

const refreshInterval = 500;

export async function tailLogs(fn: DeployedFunction) {
  usagePrompt();
  const cw = new CloudWatchLogs({});
  let lastReceivedTimestamp = Date.now();
  return setInterval(async () => {
    try {
      const events = await cw.filterLogEvents({
        logGroupName: `/aws/lambda/${fn.name}`,
        startTime: lastReceivedTimestamp,
      });
      if (events.events && events.events.length > 0) {
        const recentEvents = events.events
          .filter((x) => (x.timestamp ?? 0) > lastReceivedTimestamp)
          .map((x) => {
            const matches = x.message
              ?.matchAll(
                /^(\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)\s+\S+\s+\S+\s+(.*)$/gms
              )
              .next().value;
            return matches ? { time: matches[1], message: matches[2] } : null;
          })
          .filter((x) => x);
        recentEvents?.forEach((e) => {
          console.log(`${e?.time} ${fn.id}`);
          console.log(e?.message);
        });
        lastReceivedTimestamp =
          events.events[events.events.length - 1].timestamp ??
          lastReceivedTimestamp;
      }
    } catch (e) {}
  }, refreshInterval);
}
