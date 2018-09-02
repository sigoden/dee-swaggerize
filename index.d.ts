import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express-serve-static-core';
import { Spec } from 'swagger-schema-official'

export function swaggerize(app: Express, options: SwaggerizeOptions): void;

export interface SwaggerizeOptions {
  // swagger spec doc or path to swagger file
  api: Spec | string;
  // handler funcs
  handlers?: HandlerFuncMap;
  // security funcs
  security?: HandlerFuncMap;
  // map routes
  routeIteratee?: (route: Route) => Route;
}

declare global {
  namespace Express {
    export interface Request {
      swagRoute: Route;
    }
  }
}

export interface HandlerFuncMap {
  [k: string]: RequestHandler;
}

export interface Route {
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