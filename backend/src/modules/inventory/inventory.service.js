const model = require("./inventory.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await model.findAll({
        offset, limit,
        warehouseId: query.warehouseId ? parseInt(query.warehouseId) : null,
        productId: query.productId ? parseInt(query.productId) : null
    });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function update(id, data) {
    const inv = await model.update(id, data);
    if (!inv) throw Object.assign(new Error("Inventory not found"), { statusCode: 404 });
    return inv;
}

module.exports = { getAll, update };
