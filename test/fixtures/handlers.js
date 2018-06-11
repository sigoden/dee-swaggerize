var store = require('./lib/store');

module.exports = {
  findPets: function(req, res, next) {
    res.json(store.all());
  },
  addPet: function(req, res, next) {
    res.json(store.get(store.put(req.body)));
  },
  findPetById: function(req, res, next) {
    res.json(store.get(req.params['id']));
  },
  deletePet: function(req, res, next) {
    store.delete(req.params['id']);
    res.json(store.all());
  }
};
