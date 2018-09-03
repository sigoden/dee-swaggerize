import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express-serve-static-core';
import { Spec } from 'swagger-schema-official';

declare function swaggerize(
  app: Express,
  options: swaggerize.SwaggerizeOptions
): void;

declare namespace swaggerize {
  interface HandlerFuncMap {
    [k: string]: RequestHandler;
  }

  interface Route {
    path: string;
    name: string;
    description: string;
    method: string;
    security: object;
    validators: Array<object>;
    handler?: RequestHandler;
    consumes: string;
    produces: string;
  }

  interface SwaggerizeOptions {
    // swagger spec doc or path to swagger file
    api: Spec | string;
    // handler funcs
    handlers?: HandlerFuncMap;
    // security funcs
    security?: HandlerFuncMap;
    // map routes
    routeIteratee?: (route: Route) => Route;
  }
}

declare global {
  namespace Express {
    export interface Request {
      swagRoute: swaggerize.Route;
    }
  }
}

export = swaggerize