import { UserPool } from '@aws-cdk/aws-cognito';
import { TriggerOpMap } from './op-map';
import { Trigger, FunctionMap, TriggerMap } from './types';

export function addTriggers<T extends TriggerMap>(
  pool: UserPool,
  pars: { triggers: T }
): FunctionMap<T> {
  const fnMap = {} as FunctionMap<T>;
  Object.entries(pars.triggers).forEach(([trigger, builder]) => {
    const fn = builder(pool.stack, `${pool.node.id}-${trigger}`);
    pool.addTrigger(TriggerOpMap[trigger as Trigger], fn);
    fnMap[trigger as Trigger] = fn as FunctionMap<T>[Trigger];
  });
  return fnMap;
}
