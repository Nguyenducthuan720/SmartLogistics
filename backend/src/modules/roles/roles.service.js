const rolesModel = require("./roles.model");

async function getAll() {
    return rolesModel.findAll();
}

async function getById(roleId) {
    const role = await rolesModel.findById(roleId);
    if (!role) throw Object.assign(new Error("Role not found"), { statusCode: 404 });
    const permissions = await rolesModel.getRolePermissions(roleId);
    return { ...role, permissions };
}

async function createRole(data) {
    return rolesModel.create(data);
}

async function updateRole(roleId, data) {
    const role = await rolesModel.update(roleId, data);
    if (!role) throw Object.assign(new Error("Role not found"), { statusCode: 404 });
    return role;
}

async function updatePermissions(roleId, permissionIds) {
    const role = await rolesModel.findById(roleId);
    if (!role) throw Object.assign(new Error("Role not found"), { statusCode: 404 });
    await rolesModel.assignPermissions(roleId, permissionIds);
    return rolesModel.getRolePermissions(roleId);
}

module.exports = { getAll, getById, createRole, updateRole, updatePermissions };
