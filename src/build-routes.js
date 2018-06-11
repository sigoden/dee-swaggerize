'use strict';

var utils = require('./utils'),
  validation = require('./validator'),
  thing = require('core-util-is'),
  assert = require('assert');

/**
 * Convert definition of api to something we can work with.
 * @param options
 * @returns {Array}
 */
function buildRoutes(options) {
  var api, routes, handlers, defaulthandler, validator;

  api = options.api;
  handlers = options.handlers;
  defaulthandler = options.defaulthandler;
  validator = validation(options);
  routes = [];

  Object.keys(api.paths).forEach(function(path) {
    var def = options.api.paths[path];

    utils.verbs.forEach(function(verb) {
      var route, pathnames, operation, validators;

      operation = def[verb];

      if (!operation) {
        return;
      }

      route = {
        path: path,
        name: operation.operationId,
        description: operation.description,
        method: verb,
        security: buildSecurity(
          options,
          api.securityDefinitions,
          operation.security || def.security || api.security
        ),
        validators: [],
        handler: defaulthandler || undefined,
        consumes: operation.consumes || api.consumes,
        produces: operation.produces || api.produces
      };

      validators = {};

      if (def.parameters) {
        def.parameters.forEach(function(parameter) {
          validators[parameter.in + parameter.name] = parameter;
        });
      }

      if (operation.parameters) {
        operation.parameters.forEach(function(parameter) {
          validators[parameter.in + parameter.name] = parameter;
        });
      }

      route.validators = validator.makeAll(validators, route);

      pathnames = [];

      //Figure out the names from the params.
      path.split('/').forEach(function(element) {
        if (element) {
          pathnames.push(element);
        }
      });

      var operationId = operation.operationId;
      if (handlers[operationId]) {
        route.handler = handlers[operationId];
      }

      if (route.handler) {
        if (typeof options.routeIteratee === 'function') {
          route = options.routeIteratee(route);
        }
        routes.push(route);
      }
    });
  });

  return routes;
}

/**
 * Build the security definition for this route.
 * @param securityDefinitions from the api.
 * @param routeSecurity the security defined on this route.
 * @returns {*}
 */
function buildSecurity(options, securityDefinitions, routeSecurity) {
  var security = {};

  if (!securityDefinitions || !routeSecurity || !thing.isArray(routeSecurity)) {
    return undefined;
  }

  routeSecurity.forEach(function(definition) {
    Object.keys(definition).forEach(function(defName) {
      assert.ok(
        securityDefinitions[defName],
        'Unrecognized security definition (' + defName + ')'
      );

      security[defName] = {};
      //The value of security scheme is a list of scope names required for the execution
      security[defName].scopes = definition[defName];

      security[defName].scopes.forEach(function(scope) {
        assert.ok(
          thing.isString(scope) &&
            Object.keys(securityDefinitions[defName].scopes).indexOf(scope) >
              -1,
          'Unrecognized scope (' + scope + ').'
        );
      });

      if (options.security) {
        security[defName].authorize = options.security[defName];
      }
    });
  });

  return security;
}

module.exports = buildRoutes;
