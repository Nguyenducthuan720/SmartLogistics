const pool = require("../../config/database");

async function getStats() {
    const stats = {};

    const orders = await pool.request().query(`
        SELECT OrderStatus, COUNT(*) AS Total FROM Orders GROUP BY OrderStatus
    `);
    stats.orderStats = orders.recordset;

    const shipments = await pool.request().query(`
        SELECT ShipmentStatus, COUNT(*) AS Total FROM Shipments GROUP BY ShipmentStatus
    `);
    stats.shipmentStats = shipments.recordset;

    const drivers = await pool.request().query(`
        SELECT Status, COUNT(*) AS Total FROM Drivers GROUP BY Status
    `);
    stats.driverStats = drivers.recordset;

    const vehicles = await pool.request().query(`
        SELECT Status, COUNT(*) AS Total FROM Vehicles GROUP BY Status
    `);
    stats.vehicleStats = vehicles.recordset;

    const inventory = await pool.request().query("SELECT COUNT(*) AS total FROM Inventory");
    stats.totalInventoryItems = inventory.recordset[0].total;

    const warehouses = await pool.request().query("SELECT COUNT(*) AS total FROM Warehouses");
    stats.totalWarehouses = warehouses.recordset[0].total;

    return stats;
}

async function getWarehouseSummary() {
    const result = await pool.request().query(`
        SELECT w.WarehouseID, w.WarehouseName, COUNT(i.InventoryID) AS ProductCount,
               SUM(i.Quantity) AS TotalQuantity
        FROM Warehouses w
        LEFT JOIN Inventory i ON w.WarehouseID = i.WarehouseID
        GROUP BY w.WarehouseID, w.WarehouseName
        ORDER BY w.WarehouseName
    `);
    return result.recordset;
}

module.exports = { getStats, getWarehouseSummary };
