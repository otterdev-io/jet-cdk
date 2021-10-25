import { Construct } from '@aws-cdk/core';

export type Builder<T, S = Construct> = (scope: S, id: string) => T;

export function builderOf<T, S = Construct>(thing: T): Builder<T, S> {
  return () => thing;
}

export function tagOf<B>(
  builder: (s: string) => B
): (strings: TemplateStringsArray, ...expr: string[]) => B {
  return (strings, ...expr) => {
    const str = strings.reduce(
      (total, str, i) => total + str + (expr[i] ?? ''),
      ''
    );
    return builder(str);
  };
}
