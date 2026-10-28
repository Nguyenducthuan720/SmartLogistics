const model = require("./dashboard.model");

async function getStats() { return model.getStats(); }
async function getWarehouseSummary() { return model.getWarehouseSummary(); }

module.exports = { getStats, getWarehouseSummary };
