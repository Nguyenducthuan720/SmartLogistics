const model = require("./products.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await model.findAll({
        offset, limit,
        categoryId: query.categoryId ? parseInt(query.categoryId) : null,
        search: query.search || null
    });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const p = await model.findById(id);
    if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    return p;
}

async function create(data) { return model.create(data); }

async function update(id, data) {
    const p = await model.update(id, data);
    if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    return p;
}

module.exports = { getAll, getById, create, update };
