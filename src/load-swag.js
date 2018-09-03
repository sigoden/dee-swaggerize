'use strict';
var path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml');

function loadSwagger(api) {
  if (typeof api === 'object') return api;
  var swaggerFile = path.resolve(api);
  var data = fs.readFileSync(swaggerFile, 'utf8');
  var result;
  try {
    if (path.extname(swaggerFile) === '.json') {
      result = JSON.parse(data);
    } else {
      result = yaml.safeLoad(data);
    }
  } catch (err) {
    new Error('parse file ' + swaggerFile + ' failed, ' + err.message);
  }
  return result;
}

module.exports = loadSwagger;
