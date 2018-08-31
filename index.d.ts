import {
  Express,
  Request,
  Response,
  NextFunction
} from 'express-serve-static-core';

declare function swaggerize(app: Express, options: SwaggerizeOptions);

interface SwaggerizeOptions {
  // swagger spec doc
  api: object;
  // handler funcs
  handlers: Map<HandlerFunc>;
  // security funcs
  security: Map<HandlerFunc>;
  // map routes
  routeIteratee: (route: Route) => Route;
}

interface Map<T> {
  [key: string]: T;
}

interface RequestWithRoute extends Request {
  route: Route;
}

interface Route {
  path: string;
  name: string;
  description: string;
  method: string;
  security: object;
  validators: object[];
  handler?: HandlerFunc;
  consumes: string;
  produces: string;
}

type HandlerFunc = (req: Request, res: RequestWithRoute, next: NextFunction) => void;

export = swaggerize;