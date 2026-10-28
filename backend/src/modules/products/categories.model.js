const pool = require("../../config/database");

async function findAll() {
    const result = await pool.request().query("SELECT * FROM Categories WHERE IsActive = 1 ORDER BY CategoryName");
    return result.recordset;
}

module.exports = { findAll };
