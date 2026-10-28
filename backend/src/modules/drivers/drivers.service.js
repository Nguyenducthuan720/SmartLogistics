const driversModel = require("./drivers.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await driversModel.findAll({ offset, limit, status: query.status || null });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const driver = await driversModel.findById(id);
    if (!driver) throw Object.assign(new Error("Driver not found"), { statusCode: 404 });
    return driver;
}

async function create(data) { return driversModel.create(data); }
async function update(id, data) {
    const driver = await driversModel.update(id, data);
    if (!driver) throw Object.assign(new Error("Driver not found"), { statusCode: 404 });
    return driver;
}
async function updateLocation(id, lat, lng) {
    await driversModel.updateLocation(id, lat, lng);
}

async function getMe(userId) {
    return driversModel.findByUserId(userId);
}

module.exports = { getAll, getById, create, update, updateLocation, getMe };
