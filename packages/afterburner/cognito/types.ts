import { Builder } from '../common/lib';
import { IFunction } from '@aws-cdk/aws-lambda';
import { TriggerOpMap } from './op-map';

export type FunctionMap<T> = {
  [K in keyof T]: T[K] extends Builder<infer F> ? F : never;
};

export type Trigger = keyof typeof TriggerOpMap;

export type TriggerMap = Partial<Record<Trigger, Builder<IFunction>>>;
