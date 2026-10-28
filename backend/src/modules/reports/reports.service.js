const model = require("./reports.model");

async function getOrderReport(query) { return model.getOrderReport(query); }
async function getRevenueByMonth() { return model.getRevenueByMonth(); }
async function getDriverPerformance() { return model.getDriverPerformance(); }

module.exports = { getOrderReport, getRevenueByMonth, getDriverPerformance };
