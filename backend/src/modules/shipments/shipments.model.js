const pool = require("../../config/database");

async function findAll({ offset, limit, status, driverId, warehouseId }) {
    let where = [];
    const request = pool.request();

    if (status) { where.push("s.ShipmentStatus = @Status"); request.input("Status", status); }
    if (driverId) { where.push("s.DriverID = @DriverID"); request.input("DriverID", driverId); }
    if (warehouseId) { where.push("s.WarehouseID = @WarehouseID"); request.input("WarehouseID", warehouseId); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Shipments s ${whereClause}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT s.*, o.OrderCode, o.OrderStatus,
               u.FullName AS DriverName, v.LicensePlate,
               w.WarehouseName, r.RouteCode
        FROM Shipments s
        JOIN Orders o ON s.OrderID = o.OrderID
        LEFT JOIN Drivers d ON s.DriverID = d.DriverID
        LEFT JOIN Users u ON d.UserID = u.UserID
        LEFT JOIN Vehicles v ON s.VehicleID = v.VehicleID
        LEFT JOIN Warehouses w ON s.WarehouseID = w.WarehouseID
        LEFT JOIN Routes r ON s.RouteID = r.RouteID
        ${whereClause}
        ORDER BY s.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

    return { data: dataResult.recordset, total };
}

async function findById(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query(`
            SELECT s.*, o.OrderCode, o.OrderStatus, o.PickupAddress, o.DeliveryAddress,
                   o.PickupProvince, o.DeliveryProvince,
                   u.FullName AS DriverName, d.LicenseNumber,
                   v.LicensePlate, v.VehicleType,
                   w.WarehouseName, r.RouteCode
            FROM Shipments s
            JOIN Orders o ON s.OrderID = o.OrderID
            LEFT JOIN Drivers d ON s.DriverID = d.DriverID
            LEFT JOIN Users u ON d.UserID = u.UserID
            LEFT JOIN Vehicles v ON s.VehicleID = v.VehicleID
            LEFT JOIN Warehouses w ON s.WarehouseID = w.WarehouseID
            LEFT JOIN Routes r ON s.RouteID = r.RouteID
            WHERE s.ShipmentID = @ShipmentID
        `);
    return result.recordset[0] || null;
}

async function create({ orderId, driverId, vehicleId, routeId, warehouseId }) {
    const result = await pool.request()
        .input("OrderID", orderId)
        .input("DriverID", driverId || null)
        .input("VehicleID", vehicleId || null)
        .input("RouteID", routeId || null)
        .input("WarehouseID", warehouseId || null)
        .query(`
            INSERT INTO Shipments (OrderID, DriverID, VehicleID, RouteID, WarehouseID)
            OUTPUT INSERTED.*
            VALUES (@OrderID, @DriverID, @VehicleID, @RouteID, @WarehouseID)
        `);
    return result.recordset[0];
}

async function update(shipmentId, data) {
    const fields = [];
    const request = pool.request();
    request.input("ShipmentID", shipmentId);

    if (data.driverId !== undefined) { fields.push("DriverID = @DriverID"); request.input("DriverID", data.driverId); }
    if (data.vehicleId !== undefined) { fields.push("VehicleID = @VehicleID"); request.input("VehicleID", data.vehicleId); }
    if (data.routeId !== undefined) { fields.push("RouteID = @RouteID"); request.input("RouteID", data.routeId); }
    if (data.warehouseId !== undefined) { fields.push("WarehouseID = @WarehouseID"); request.input("WarehouseID", data.warehouseId); }
    if (data.status !== undefined) { fields.push("ShipmentStatus = @Status"); request.input("Status", data.status); }
    if (data.startTime !== undefined) { fields.push("StartTime = @StartTime"); request.input("StartTime", data.startTime); }
    if (data.endTime !== undefined) { fields.push("EndTime = @EndTime"); request.input("EndTime", data.endTime); }
    if (data.estimatedArrival !== undefined) { fields.push("EstimatedArrival = @EstimatedArrival"); request.input("EstimatedArrival", data.estimatedArrival); }
    if (data.actualArrival !== undefined) { fields.push("ActualArrival = @ActualArrival"); request.input("ActualArrival", data.actualArrival); }

    if (fields.length === 0) return null;

    await request.query(`
        UPDATE Shipments SET ${fields.join(", ")}
        WHERE ShipmentID = @ShipmentID
    `);

    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query("SELECT * FROM Shipments WHERE ShipmentID = @ShipmentID");
    return result.recordset[0] || null;
}

async function findAvailable() {
    const result = await pool.request().query(`
        SELECT s.*, o.OrderCode, o.PickupAddress, o.DeliveryAddress, o.PickupProvince, o.DeliveryProvince,
               o.TotalWeight, o.TotalAmount,
               w.WarehouseName, w.Latitude AS WarehouseLat, w.Longitude AS WarehouseLng,
               r.RouteCode, r.DistanceKM
        FROM Shipments s
        JOIN Orders o ON s.OrderID = o.OrderID
        LEFT JOIN Warehouses w ON s.WarehouseID = w.WarehouseID
        LEFT JOIN Routes r ON s.RouteID = r.RouteID
        WHERE s.DriverID IS NULL AND s.ShipmentStatus = 'WAITING'
        ORDER BY s.CreatedAt DESC
    `);
    return result.recordset;
}

async function acceptShipment(shipmentId, driverId) {
    const request = pool.request();
    request.input("ShipmentID", shipmentId);
    request.input("DriverID", driverId);

    const check = await request.query("SELECT * FROM Shipments WHERE ShipmentID = @ShipmentID AND DriverID IS NULL AND ShipmentStatus = 'WAITING'");
    if (check.recordset.length === 0) return null;

    await request.query(`
        UPDATE Shipments SET DriverID = @DriverID, ShipmentStatus = 'PICKED_UP', StartTime = GETDATE()
        WHERE ShipmentID = @ShipmentID
    `);

    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query("SELECT * FROM Shipments WHERE ShipmentID = @ShipmentID");
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, update, findAvailable, acceptShipment };
