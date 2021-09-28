import { Construct } from '@aws-cdk/core';

export type Builder<T, S = Construct> = (scope: S, id: string) => T;

export function builderOf<T>(thing: T): Builder<T> {
  return (scope: Construct, id: string) => thing;
}
