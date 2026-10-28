const permissionsService = require("./permissions.service");
const { success } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const grouped = req.query.grouped === "true";
        const permissions = grouped ? await permissionsService.getByModule() : await permissionsService.getAll();
        return success(res, permissions);
    } catch (err) {
        logger.error("Get permissions failed", { error: err.message });
        next(err);
    }
}

module.exports = { getAll };
