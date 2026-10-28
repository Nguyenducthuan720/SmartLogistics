const usersModel = require("./users.model");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const search = query.search || null;

    const { data, total } = await usersModel.findAll({ page, limit, offset, search });

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

async function getById(userId) {
    const user = await usersModel.findById(userId);
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
}

async function updateUser(userId, updateData) {
    const user = await usersModel.update(userId, updateData);
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
}

async function deleteUser(userId) {
    const deleted = await usersModel.remove(userId);
    if (!deleted) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
}

module.exports = { getAll, getById, updateUser, deleteUser };
