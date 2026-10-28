const model = require("./settings.model");

async function getAll() { return model.findAll(); }
async function getByKey(key) { return model.findByKey(key); }
async function update(key, value, description) { return model.upsert(key, value, description); }

module.exports = { getAll, getByKey, update };
