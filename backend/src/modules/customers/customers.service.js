const customersModel = require("./customers.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await customersModel.findAll({ offset, limit, search: query.search || null });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const c = await customersModel.findById(id);
    if (!c) throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
    return c;
}

async function getMe(userId) {
    const c = await customersModel.findByUserId(userId);
    if (!c) throw Object.assign(new Error("Customer profile not found"), { statusCode: 404 });
    return c;
}

async function create(data) { return customersModel.create(data); }
async function update(id, data) {
    const c = await customersModel.update(id, data);
    if (!c) throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
    return c;
}

async function ensureProfile(userId) { return customersModel.ensureCustomerProfile(userId); }

module.exports = { getAll, getById, getMe, create, update, ensureProfile };
