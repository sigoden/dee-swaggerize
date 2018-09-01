var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');

function loadSwagger(api, cb) {
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
    return cb(
      new Error('parse file ' + swaggerFile + ' failed, ' + err.message)
    );
  }
  return cb(null, result);
}

module.exports = loadSwagger;
