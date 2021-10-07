import {
  AddRoutesOptions,
  HttpMethod,
  IHttpRouteIntegration,
  IHttpRoute,
  IHttpRouteAuthorizer,
} from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../lib';

/**
 * An object mapping from paths to H
 */
export type PathMap = Record<string, Partial<MethodMap>>;

/**
 * An object mapping from some Methods to H
 */
export type MethodMap = Record<
  Method,
  Builder<RouteOptions<IHttpRouteIntegration, IHttpRouteAuthorizer>>
>;

/**
 * AddRoutesOptions, without 'path' and 'methods', and with some fields strongly typed
 */
export type RouteOptions<
  I extends IHttpRouteIntegration,
  A extends IHttpRouteAuthorizer
> = Omit<
  AddRoutesOptions,
  'path' | 'methods' | 'integration' | 'authorizer'
> & {
  integration: I;
  authorizer?: A;
};

/**
 * HttpMethods
 */
export type Method = keyof typeof HttpMethod;

/**
 * Map out fields to their builder return type, or the default type if its a string
 */
export type PathMethodFields<R extends Partial<MethodMap>> = {
  [K in keyof R]: R[K] extends Builder<RouteOptions<infer TI, infer TA>>
    ? PathMethodRouting<TI, TA>
    : never;
};

/**
 * A mapping from a path, to a method, to a type T
 */
export type Routing<PM extends PathMap> = {
  [K in keyof PM]: PathMethodFields<PM[K]>;
};

export type PathMethodRouting<
  I extends IHttpRouteIntegration,
  A extends IHttpRouteAuthorizer
> = {
  integration: I;
  authorizer?: A;
  httpRoute: IHttpRoute;
};
