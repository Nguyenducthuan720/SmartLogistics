const usersService = require("./users.service");
const { success, notFound } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const result = await usersService.getAll(req.query);
        return res.status(200).json({
            success: true,
            message: "Users retrieved",
            data: result.data,
            pagination: result.pagination
        });
    } catch (err) {
        logger.error("Get all users failed", { error: err.message });
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const user = await usersService.getById(parseInt(req.params.id));
        return success(res, user);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Get user failed", { error: err.message });
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const user = await usersService.updateUser(parseInt(req.params.id), req.body);
        return success(res, user, "User updated");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Update user failed", { error: err.message });
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        await usersService.deleteUser(parseInt(req.params.id));
        return success(res, null, "User deactivated");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Delete user failed", { error: err.message });
        next(err);
    }
}

module.exports = { getAll, getById, update, remove };
