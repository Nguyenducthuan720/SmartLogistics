const pool = require("../../config/database");

async function findAll() {
    const result = await pool.request().query("SELECT * FROM Warehouses ORDER BY WarehouseName");
    return result.recordset;
}

async function findById(id) {
    const result = await pool.request().input("WarehouseID", id)
        .query("SELECT * FROM Warehouses WHERE WarehouseID = @WarehouseID");
    return result.recordset[0] || null;
}

async function create(data) {
    const result = await pool.request()
        .input("WarehouseName", data.warehouseName)
        .input("Phone", data.phone || null)
        .input("Email", data.email || null)
        .input("Province", data.province || null)
        .input("District", data.district || null)
        .input("Address", data.address || null)
        .input("Latitude", data.latitude || null)
        .input("Longitude", data.longitude || null)
        .input("Capacity", data.capacity || null)
        .query(`
            INSERT INTO Warehouses (WarehouseName, Phone, Email, Province, District, Address, Latitude, Longitude, Capacity)
            OUTPUT INSERTED.*
            VALUES (@WarehouseName, @Phone, @Email, @Province, @District, @Address, @Latitude, @Longitude, @Capacity)
        `);
    return result.recordset[0];
}

async function update(id, data) {
    const fields = [];
    const request = pool.request();
    request.input("WarehouseID", id);
    const map = {
        warehouseName: "WarehouseName", phone: "Phone", email: "Email",
        province: "Province", district: "District", address: "Address",
        latitude: "Latitude", longitude: "Longitude", capacity: "Capacity", status: "Status"
    };
    for (const [key, col] of Object.entries(map)) {
        if (data[key] !== undefined) {
            fields.push(`${col} = @${col}`);
            request.input(col, data[key]);
        }
    }
    if (fields.length === 0) return null;
    const result = await request.query(`UPDATE Warehouses SET ${fields.join(", ")} OUTPUT INSERTED.* WHERE WarehouseID = @WarehouseID`);
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, update };
