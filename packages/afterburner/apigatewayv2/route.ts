import {
  AddRoutesOptions,
  HttpApi,
  HttpMethod,
  HttpRoute,
} from '@aws-cdk/aws-apigatewayv2';
import { Construct } from '@aws-cdk/core';
import { toId } from '../fn/lib';
import {
  Method,
  RouteHandler,
  RouteIntegrationBuilder,
  RouteOptions,
  RouteOptionsWithIntegrationBuilder,
  Routing,
} from './types';

/**
 * Set up routing for this api. Takes an object mapping from paths to methods to handlers
 * @param api The api to route
 * @param routes
 * @returns An object mapping from paths to methods to integrations
 */
export function route(
  api: HttpApi,
  routes: Routing<RouteHandler>
): Routing<HttpRoute> {
  const handlers: Routing<HttpRoute> = {};
  Object.entries(routes).forEach(([path, routeHandler]) =>
    Object.entries(routeHandler).forEach(([method, methodHandler]) => {
      if (methodHandler) {
        const options = addRoutesOptions(
          api.stack,
          path,
          method as Method,
          methodHandler
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
  return (
    typeof r === 'object' && 'handler' in r && typeof r['handler'] === 'object'
  );
}

function isRouteOptionsWithIntegrationBuilder(
  r: RouteHandler
): r is RouteOptionsWithIntegrationBuilder {
  return (
    typeof r === 'object' &&
    'handler' in r &&
    typeof r['handler'] === 'function'
  );
}

function isRouteIntegrationBuilder(
  r: RouteHandler
): r is RouteIntegrationBuilder {
  return typeof r === 'function';
}

function addRoutesOptions(
  scope: Construct,
  path: string,
  method: Method,
  handler: RouteHandler
): AddRoutesOptions {
  const id = toId(`${method}-${path}`);
  if (isRouteOptions(handler)) {
    return { path, methods: [HttpMethod[method]], ...handler };
  } else if (isRouteOptionsWithIntegrationBuilder(handler)) {
    return {
      path,
      methods: [HttpMethod[method]],
      authorizer: handler.authorizer,
      authorizationScopes: handler.authorizationScopes,
      integration: handler.handler(scope, id),
    };
  } else if (isRouteIntegrationBuilder(handler)) {
    return {
      path,
      methods: [HttpMethod[method]],
      integration: handler(scope, id),
    };
  }
  throw new Error('No matching type of handler');
}
