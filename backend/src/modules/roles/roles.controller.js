const rolesService = require("./roles.service");
const { success, created, notFound } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const roles = await rolesService.getAll();
        return success(res, roles);
    } catch (err) {
        logger.error("Get roles failed", { error: err.message });
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const role = await rolesService.getById(parseInt(req.params.id));
        return success(res, role);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Get role failed", { error: err.message });
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const role = await rolesService.createRole(req.body);
        return created(res, role, "Role created");
    } catch (err) {
        logger.error("Create role failed", { error: err.message });
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const role = await rolesService.updateRole(parseInt(req.params.id), req.body);
        return success(res, role, "Role updated");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Update role failed", { error: err.message });
        next(err);
    }
}

async function updatePermissions(req, res, next) {
    try {
        const { permissionIds } = req.body;
        const permissions = await rolesService.updatePermissions(parseInt(req.params.id), permissionIds);
        return success(res, permissions, "Permissions updated");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        logger.error("Update permissions failed", { error: err.message });
        next(err);
    }
}

module.exports = { getAll, getById, create, update, updatePermissions };
