const pool = require("../../config/database");

async function findAll() {
    const result = await pool.request().query("SELECT * FROM SystemSettings ORDER BY SettingKey");
    return result.recordset;
}

async function findByKey(key) {
    const result = await pool.request()
        .input("SettingKey", key)
        .query("SELECT * FROM SystemSettings WHERE SettingKey = @SettingKey");
    return result.recordset[0] || null;
}

async function upsert(key, value, description) {
    const existing = await findByKey(key);
    if (existing) {
        await pool.request()
            .input("SettingKey", key)
            .input("SettingValue", value)
            .input("Description", description || null)
            .query("UPDATE SystemSettings SET SettingValue = @SettingValue, Description = @Description, UpdatedAt = GETDATE() WHERE SettingKey = @SettingKey");
    } else {
        await pool.request()
            .input("SettingKey", key)
            .input("SettingValue", value)
            .input("Description", description || null)
            .query("INSERT INTO SystemSettings (SettingKey, SettingValue, Description) VALUES (@SettingKey, @SettingValue, @Description)");
    }
}

module.exports = { findAll, findByKey, upsert };
