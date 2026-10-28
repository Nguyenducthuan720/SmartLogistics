const pool = require("../../config/database");

async function findByShipment(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query(`
            SELECT * FROM TrackingHistory
            WHERE ShipmentID = @ShipmentID
            ORDER BY CreatedAt DESC
        `);
    return result.recordset;
}

async function create(data) {
    const result = await pool.request()
        .input("ShipmentID", data.shipmentId)
        .input("Status", data.status)
        .input("Description", data.description || null)
        .input("Latitude", data.latitude || null)
        .input("Longitude", data.longitude || null)
        .query(`
            INSERT INTO TrackingHistory (ShipmentID, Status, Description, Latitude, Longitude)
            OUTPUT INSERTED.*
            VALUES (@ShipmentID, @Status, @Description, @Latitude, @Longitude)
        `);
    return result.recordset[0];
}

module.exports = { findByShipment, create };
