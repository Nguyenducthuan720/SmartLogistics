const pool = require("../../config/database");

async function findAll({ offset, limit, status }) {
    let where = "";
    const request = pool.request();
    if (status) { where = "WHERE v.Status = @Status"; request.input("Status", status); }

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Vehicles v ${where}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT v.*, d.LicenseNumber, u.FullName AS DriverName
        FROM Vehicles v
        LEFT JOIN Drivers d ON v.DriverID = d.DriverID
        LEFT JOIN Users u ON d.UserID = u.UserID
        ${where}
        ORDER BY v.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return { data: dataResult.recordset, total };
}

async function findById(vehicleId) {
    const result = await pool.request()
        .input("VehicleID", vehicleId)
        .query(`
            SELECT v.*, d.LicenseNumber, u.FullName AS DriverName
            FROM Vehicles v
            LEFT JOIN Drivers d ON v.DriverID = d.DriverID
            LEFT JOIN Users u ON d.UserID = u.UserID
            WHERE v.VehicleID = @VehicleID
        `);
    return result.recordset[0] || null;
}

async function create(data) {
    const result = await pool.request()
        .input("LicensePlate", data.licensePlate)
        .input("VehicleType", data.vehicleType || null)
        .input("Brand", data.brand || null)
        .input("Model", data.model || null)
        .input("CapacityWeight", data.capacityWeight || null)
        .input("CapacityVolume", data.capacityVolume || null)
        .input("FuelType", data.fuelType || null)
        .query(`
            INSERT INTO Vehicles (LicensePlate, VehicleType, Brand, Model, CapacityWeight, CapacityVolume, FuelType)
            OUTPUT INSERTED.*
            VALUES (@LicensePlate, @VehicleType, @Brand, @Model, @CapacityWeight, @CapacityVolume, @FuelType)
        `);
    return result.recordset[0];
}

async function update(vehicleId, data) {
    const fields = [];
    const request = pool.request();
    request.input("VehicleID", vehicleId);

    if (data.licensePlate !== undefined) { fields.push("LicensePlate = @LicensePlate"); request.input("LicensePlate", data.licensePlate); }
    if (data.vehicleType !== undefined) { fields.push("VehicleType = @VehicleType"); request.input("VehicleType", data.vehicleType); }
    if (data.brand !== undefined) { fields.push("Brand = @Brand"); request.input("Brand", data.brand); }
    if (data.model !== undefined) { fields.push("Model = @Model"); request.input("Model", data.model); }
    if (data.capacityWeight !== undefined) { fields.push("CapacityWeight = @CapacityWeight"); request.input("CapacityWeight", data.capacityWeight); }
    if (data.capacityVolume !== undefined) { fields.push("CapacityVolume = @CapacityVolume"); request.input("CapacityVolume", data.capacityVolume); }
    if (data.fuelType !== undefined) { fields.push("FuelType = @FuelType"); request.input("FuelType", data.fuelType); }
    if (data.status !== undefined) { fields.push("Status = @Status"); request.input("Status", data.status); }
    if (data.driverId !== undefined) { fields.push("DriverID = @DriverID"); request.input("DriverID", data.driverId); }

    if (fields.length === 0) return null;
    fields.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
        UPDATE Vehicles SET ${fields.join(", ")}
        OUTPUT INSERTED.*
        WHERE VehicleID = @VehicleID
    `);
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, update };
