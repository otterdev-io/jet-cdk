import { Construct } from '@aws-cdk/core';

export type Builder<T, S = Construct> = (scope: S, id: string) => T;
