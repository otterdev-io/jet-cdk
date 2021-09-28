import {
  AddRoutesOptions,
  HttpApi,
  HttpMethod,
  HttpRoute,
} from '@aws-cdk/aws-apigatewayv2';
import { Construct } from '@aws-cdk/core';
import { Builder } from '../common/lib';
import { toId } from '../functions/lib';
import { Method, RouteHandler, RouteOptions, Routing } from './types';

/**
 * Set up routing for this api. Takes an object mapping from paths to methods to handlers
 * @param api The api to route
 * @param routes A route mapping
 * @param defaultOptions The options to use when a string is provided as a mapping
 * @returns An object mapping from paths to methods to integrations
 */
export function route(
  api: HttpApi,
  props: {
    routes: Routing<RouteHandler>;
    defaultOptions?: (s: string) => Exclude<RouteHandler, string>;
  }
): Routing<HttpRoute> {
  const handlers: Routing<HttpRoute> = {};
  Object.entries(props.routes).forEach(([path, routeHandler]) =>
    Object.entries(routeHandler).forEach(([method, methodHandler]) => {
      if (methodHandler) {
        const options = addRoutesOptions(
          api.stack,
          path,
          method as Method,
          methodHandler,
          props.defaultOptions
        );
        const handler = api.addRoutes(options)[0];
        if (handlers[path]) {
          handlers[path][method as Method] = handler;
        } else {
          handlers[path] = { [method]: handler };
        }
      }
    })
  );
  return handlers;
}

function isRouteOptions(r: RouteHandler): r is RouteOptions {
  return typeof r === 'object' && typeof r['integration'] === 'object';
}
function isRouteOptionsBuilder(r: RouteHandler): r is Builder<RouteOptions> {
  return typeof r === 'function';
}

function addRoutesOptions(
  scope: Construct,
  path: string,
  method: Method,
  handler: RouteHandler,
  defaultRouteOptions?: (s: string) => Exclude<RouteHandler, string>
): AddRoutesOptions {
  const id = toId(`${method}-${path}`);
  if (typeof handler === 'string') {
    if (!defaultRouteOptions) {
      throw new Error(
        'Need to supply default route options to use a string handler!'
      );
    }
    return addRoutesOptions(
      scope,
      path,
      method,
      defaultRouteOptions(handler),
      defaultRouteOptions
    );
  } else if (isRouteOptionsBuilder(handler)) {
    return {
      path,
      methods: [HttpMethod[method]],
      ...handler(scope, id),
    };
  } else if (isRouteOptions(handler)) {
    return { path, methods: [HttpMethod[method]], ...handler };
  }
  throw new Error('No matching type of handler');
}
