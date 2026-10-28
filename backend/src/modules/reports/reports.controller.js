const service = require("./reports.service");
const { success } = require("../../utils/response");

async function orderReport(req, res, next) {
    try { return success(res, await service.getOrderReport(req.query)); } catch (err) { next(err); }
}
async function revenueReport(req, res, next) {
    try { return success(res, await service.getRevenueByMonth()); } catch (err) { next(err); }
}
async function driverReport(req, res, next) {
    try { return success(res, await service.getDriverPerformance()); } catch (err) { next(err); }
}

module.exports = { orderReport, revenueReport, driverReport };
