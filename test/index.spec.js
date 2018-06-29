'use strict';

var swaggerize = require('../src'),
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('supertest'),
  path = require('path');

describe('swaggerize', function() {
  var app = express();

  app.use(bodyParser.json());

  swaggerize(app, {
    api: require('./fixtures/defs/pets.json'),
    handlers: require('./fixtures/handlers'),
    security: require('./fixtures/security')
  });

  test('post /pets', function(done) {
    request(app)
      .post('/v1/petstore/pets')
      .send({ id: 0, name: 'Cat' })
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Cat');
        done();
      });
  });

  test('get /pets', function(done) {
    request(app)
      .get('/v1/petstore/pets')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        done();
      });
  });

  test('get /pets/:id', function(done) {
    request(app)
      .get('/v1/petstore/pets/0')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(403);
        request(app)
          .get('/v1/petstore/pets/0')
          .set('authorize', 'abcd')
          .end(function(error, response) {
            expect(error).toBeNull();
            expect(response.statusCode).toBe(200);
            expect(response.body.name).toBe('Cat');
            done();
          });
      });
  });

  test('delete /pets', function(done) {
    request(app)
      .delete('/v1/petstore/pets/0')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
        done();
      });
  });

  test('put /pets 405', function(done) {
    request(app)
      .put('/v1/petstore/pets')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(405);
        expect(response.headers.allow).toBe('GET, POST');
        done();
      });
  });
});

test('req.route access route generated from swagger object', function(done) {
  var app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  var options = {
    api: require('./fixtures/defs/pets.json'),
    handlers: {
      findPets: function(req, res) {
        res.json({ name: req.route.name });
      }
    }
  };
  swaggerize(app, options);

  request(app)
    .get('/v1/petstore/pets')
    .end(function(error, response) {
      expect(error).toBeNull();
      expect(response.body.name).toBe('findPets');
      done();
    });
});

describe('input validation', function() {
  var app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  var options = {
    api: require('./fixtures/defs/pets.json'),
    handlers: {
      findPetById: function(req, res) {},
      deletePet: function(req, res) {
        res.send(typeof req.body);
      },
      findPets: function(req, res) {
        res.json({
          id: 0,
          name: 'Cat',
          tags: req.query.tags
        });
      },
      addPet: function(req, res) {
        res.send(req.body);
      },
      uploadFile: function(req, res) {
        res.send(200);
      }
    },
    routeIteratee: function(route) {
      route.validators.forEach(function(validator) {
        if (!validator.schema) {
          return;
        }

        validator.schema._settings = {
          allowUnknown: true,
          stripUnknown: true
        };
      });
      return route;
    }
  };
  swaggerize(app, options);

  test('good query', function(done) {
    request(app)
      .get('/v1/petstore/pets?tags=kitty,serious')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(response.body.tags).toHaveLength(2);
        done();
      });
  });

  test('missing body', function(done) {
    request(app)
      .post('/v1/petstore/pets')
      .send('')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  test('replace body with validated version', function(done) {
    request(app)
      .post('/v1/petstore/pets')
      .send({ id: 0, name: 'fluffy', extra: '' })
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(0);
        expect(response.body.name).toBe('fluffy');
        expect(response.body.extra).toBeUndefined();
        done();
      });
  });

  test('form data', function(done) {
    request(app)
      .post('/v1/petstore/upload')
      .send('upload=asdf')
      .send('name=thing')
      .end(function(error, response) {
        expect(error).toBeNull();
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});
