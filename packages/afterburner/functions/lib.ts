import { IFunction } from '@aws-cdk/aws-lambda';
export function isIFunction(handler: unknown): handler is IFunction {
  return typeof handler === 'object' && 'functionArn' in (handler ?? {});
}

export function noExt(handler: string): string {
  return handler.replace(/\..*$/g, '');
}

export function toId(path: string): string {
  return path.replace(/[/\-{}$%#&]/g, '-').replace(/^-/g, '');
}
