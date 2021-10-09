import { ParsedDeployedDevStack } from '../common/types';
import { tailLogs } from './logs';
import { ReInterval } from 'reinterval';
import pMap from 'p-map';

// For given stacks in config, tail their cloudwatch logs
export async function startLoggingLambdas(
  stacks: Map<string, ParsedDeployedDevStack>
): Promise<ReInterval[]> {
  const stackFunctions = new Map(
    (
      await pMap(stacks.values(), async (stack) =>
        stack.jet.functions.map((fn) => [fn.id, fn] as const)
      )
    ).flatMap((fn) => fn)
  );

  if (stackFunctions.size === 0) {
    console.info('No lambdas to log');
    return [];
  } else {
    // Some functions seem to not have a name. Ignore those ones
    const devFunctions = [...stackFunctions.values()].filter((fn) => fn.name);
    return await pMap(devFunctions, tailLogs);
  }
}
