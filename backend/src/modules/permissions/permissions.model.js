const pool = require("../../config/database");

async function findAll() {
    const result = await pool.request().query("SELECT * FROM Permissions ORDER BY ModuleName, PermissionName");
    return result.recordset;
}

async function findByModule() {
    const result = await pool.request().query("SELECT * FROM Permissions ORDER BY ModuleName, PermissionName");
    const grouped = {};
    for (const p of result.recordset) {
        const module = p.ModuleName || "Other";
        if (!grouped[module]) grouped[module] = [];
        grouped[module].push(p);
    }
    return grouped;
}

module.exports = { findAll, findByModule };
