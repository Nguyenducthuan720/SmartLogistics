const pool = require("../../config/database");

async function create({ shipmentId, customerId, driverId, rating, comment }) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .input("CustomerID", customerId)
        .input("DriverID", driverId)
        .input("Rating", rating)
        .input("Comment", comment || null)
        .query(`
            INSERT INTO Reviews (ShipmentID, CustomerID, DriverID, Rating, Comment)
            OUTPUT INSERTED.*
            VALUES (@ShipmentID, @CustomerID, @DriverID, @Rating, @Comment)
        `);
    return result.recordset[0];
}

async function getByShipment(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query("SELECT * FROM Reviews WHERE ShipmentID = @ShipmentID");
    return result.recordset[0] || null;
}

async function getByDriver(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query(`
            SELECT r.*, u.FullName AS CustomerName
            FROM Reviews r
            JOIN Customers c ON r.CustomerID = c.CustomerID
            JOIN Users u ON c.UserID = u.UserID
            WHERE r.DriverID = @DriverID
            ORDER BY r.CreatedAt DESC
        `);
    return result.recordset;
}

async function getByCustomer(customerId) {
    const result = await pool.request()
        .input("CustomerID", customerId)
        .query(`
            SELECT r.*, u.FullName AS DriverName
            FROM Reviews r
            JOIN Drivers d ON r.DriverID = d.DriverID
            JOIN Users u ON d.UserID = u.UserID
            WHERE r.CustomerID = @CustomerID
            ORDER BY r.CreatedAt DESC
        `);
    return result.recordset;
}

async function getDriverRating(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query("SELECT * FROM vw_DriverRating WHERE DriverID = @DriverID");
    return result.recordset[0] || { DriverID: driverId, AvgRating: 0, ReviewCount: 0 };
}

module.exports = { create, getByShipment, getByDriver, getByCustomer, getDriverRating };
