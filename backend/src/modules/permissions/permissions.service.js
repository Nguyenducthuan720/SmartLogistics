const permissionsModel = require("./permissions.model");

async function getAll() {
    return permissionsModel.findAll();
}

async function getByModule() {
    return permissionsModel.findByModule();
}

module.exports = { getAll, getByModule };
