const vehiclesModel = require("./vehicles.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await vehiclesModel.findAll({ offset, limit, status: query.status || null });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const vehicle = await vehiclesModel.findById(id);
    if (!vehicle) throw Object.assign(new Error("Vehicle not found"), { statusCode: 404 });
    return vehicle;
}

async function create(data) { return vehiclesModel.create(data); }

async function update(id, data) {
    const vehicle = await vehiclesModel.update(id, data);
    if (!vehicle) throw Object.assign(new Error("Vehicle not found"), { statusCode: 404 });
    return vehicle;
}

module.exports = { getAll, getById, create, update };
