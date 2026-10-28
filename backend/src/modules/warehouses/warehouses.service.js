const model = require("./warehouses.model");

async function getAll() { return model.findAll(); }

async function getById(id) {
    const w = await model.findById(id);
    if (!w) throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
    return w;
}

async function create(data) { return model.create(data); }

async function update(id, data) {
    const w = await model.update(id, data);
    if (!w) throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
    return w;
}

module.exports = { getAll, getById, create, update };
