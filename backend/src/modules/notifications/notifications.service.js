const model = require("./notifications.model");

async function getByUser(userId, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const { data, total } = await model.findByUser(userId, { offset, limit });
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function create(data) { return model.create(data); }
async function markAsRead(id) { await model.markAsRead(id); }
async function markAllAsRead(userId) { await model.markAllAsRead(userId); }

module.exports = { getByUser, create, markAsRead, markAllAsRead };
