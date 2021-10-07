import {
  AddRoutesOptions,
  HttpApi,
  HttpMethod,
  IHttpRouteAuthorizer,
  IHttpRouteIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { toId } from '../functions/lib';
import { Method, PathMap, PathMethodRouting, Routing } from './types';

/**
 * Set up routing for this api. Takes an object mapping from paths to methods to handlers
 * @param api The api to route
 * @param routes A route mapping
 * @returns An object mapping from paths to methods to integrations
 */
export function route<PM extends PathMap>(
  api: HttpApi,
  routes: PM
): Routing<PM> {
  const handlers = {} as Routing<PM>;
  Object.entries(routes).forEach(([path, routeHandler]) =>
    Object.entries(routeHandler).forEach(([method, methodHandler]) => {
      if (methodHandler) {
        const options: AddRoutesOptions = {
          path,
          methods: [HttpMethod[method as Method]],
          ...methodHandler(api, toId(`${method}-${path}`)),
        };
        const httpRoute = api.addRoutes(options)[0];
        const routing: PathMethodRouting<
          IHttpRouteIntegration,
          IHttpRouteAuthorizer
        > = {
          integration: options.integration,
          authorizer: options.authorizer,
          httpRoute,
        };
        if (handlers[path]) {
          handlers[path as keyof PM][method as keyof PM[keyof PM]] =
            routing as any;
        } else {
          handlers[path as keyof PM] = {
            [method as keyof PM[keyof PM]]: {
              integration: options.integration,
              authorizer: options.authorizer,
              httpRoute,
            },
          } as any;
        }
      }
    })
  );
  return handlers;
}
