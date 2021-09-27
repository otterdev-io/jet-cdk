import {
  AddRoutesOptions,
  HttpMethod,
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Builder } from '../common/lib';

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
 * HttpMethods
 */
export type Method = keyof typeof HttpMethod;

/**
 * Types which can be used to specify a handler for a route
 * string - Use the default settings
 * RouteOptionsBuilders - RouteOptions using builders for authorizer and integration
 * RouteOptions - Full RouteOptions specification
 */
export type RouteHandler = string | RouteOptions | Builder<RouteOptions>;

/**
 * A mapping from a path, to a method, to a type T
 */
export type Routing<T> = PathMap<MethodMap<T>>;
