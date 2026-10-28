const service = require("./dashboard.service");
const { success } = require("../../utils/response");

async function getStats(req, res, next) {
    try { return success(res, await service.getStats()); } catch (err) { next(err); }
}

async function getWarehouseSummary(req, res, next) {
    try { return success(res, await service.getWarehouseSummary()); } catch (err) { next(err); }
}

module.exports = { getStats, getWarehouseSummary };
