import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-cloudwatch-logs';
import { StandardRetryStrategy } from '@aws-sdk/middleware-retry';
import { DeployedFunction } from '../common/types';
import reInterval, { ReInterval } from 'reinterval';

const minRefreshInterval = 5000;
const maxRefreshInterval = 60000;

export async function tailLogs(fn: DeployedFunction): Promise<ReInterval> {
  const cw = new CloudWatchLogsClient({
    retryStrategy: new StandardRetryStrategy(async () => 1),
  });
  let lastReceivedTimestamp = Date.now();
  let refreshInterval = minRefreshInterval;
  const reInt = reInterval(async () => {
    try {
      const events = await cw.send(
        new FilterLogEventsCommand({
          logGroupName: `/aws/lambda/${fn.name.split(':')[0]}`,
          startTime: lastReceivedTimestamp,
        })
      );
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
        refreshInterval = minRefreshInterval;
        //Make sure we're not rescheduling a destroyed interval
        if (reInt._callback) {
          reInt.reschedule(refreshInterval);
        }
      }
    } catch (e) {
      // A lambda that has never logged will trigger this
      if (!isResourceNotFoundException(e)) {
        if (!isThrottlingException(e)) {
          console.error('Error tailing logs');
          console.error(e);
        } else {
          console.warn(
            `Throttled, backing off. Current interval: ${refreshInterval}ms`
          );
        }
        if (refreshInterval < maxRefreshInterval) {
          refreshInterval = Math.min(refreshInterval * 2, maxRefreshInterval);
          if (reInt._callback) {
            reInt.reschedule(refreshInterval);
          }
        }
      }
    }
  }, refreshInterval);
  return reInt;
}

function isResourceNotFoundException(e: any): e is ResourceNotFoundException {
  return e.name === 'ResourceNotFoundException';
}

function isThrottlingException(e: any): boolean {
  return e.__type === 'ThrottlingException';
}
