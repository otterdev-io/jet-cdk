import {
  AddRoutesOptions,
  HttpMethod,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Construct } from '@aws-cdk/core';

/**
 * An object mapping from paths to H
 */
export type PathMap<H> = Record<string, H>;

/**
 * An object mapping from some Methods to H
 */
export type MethodMap<H> = Partial<Record<Method, H>>;

/**
 * AddRoutesOptions, without 'path' and 'methods'
 */
export type RouteOptions = Omit<AddRoutesOptions, 'path' | 'methods'>;

/**
 * RouteOptions, but handler is a RouteIntegrationBuilder
 */
export type RouteOptionsWithIntegrationBuilder = Omit<
  AddRoutesOptions,
  'path' | 'methods' | 'handler'
> & {
  handler: RouteIntegrationBuilder;
};

/**
 * HttpMethods
 */
export type Method = keyof typeof HttpMethod;

/**
 * Types which can be used to specify a handler for a route
 * RouteIntegrationBuilder - A builder function such as 'lambda'
 * IHttpRouteIntegration - An integration specified inline
 * RouteOptions - Full RouteOptions specification
 */
export type RouteHandler =
  | RouteIntegrationBuilder
  | RouteOptionsWithIntegrationBuilder
  | RouteOptions;

/**
 * A function which will create a IHttpRouteIntegration given scope and id
 */
export type RouteIntegrationBuilder = (
  scope: Construct,
  id: string
) => IHttpRouteIntegration;

/**
 * A mapping from a path, to a method, to a type T
 */
export type Routing<T> = PathMap<MethodMap<T>>;
