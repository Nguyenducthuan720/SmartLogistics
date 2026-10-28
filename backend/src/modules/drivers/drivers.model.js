const pool = require("../../config/database");

async function findAll({ offset, limit, status }) {
    let where = "";
    const request = pool.request();

    if (status) { where = "WHERE d.Status = @Status"; request.input("Status", status); }

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Drivers d ${where}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT d.*, u.FullName, u.Email, u.Phone, u.Username,
               v.VehicleID, v.LicensePlate, v.VehicleType
        FROM Drivers d
        JOIN Users u ON d.UserID = u.UserID
        LEFT JOIN Vehicles v ON d.DriverID = v.DriverID
        ${where}
        ORDER BY d.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return { data: dataResult.recordset, total };
}

async function findById(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query(`
            SELECT d.*, u.FullName, u.Email, u.Phone, u.Username,
                   v.VehicleID, v.LicensePlate, v.VehicleType
            FROM Drivers d
            JOIN Users u ON d.UserID = u.UserID
            LEFT JOIN Vehicles v ON d.DriverID = v.DriverID
            WHERE d.DriverID = @DriverID
        `);
    return result.recordset[0] || null;
}

async function create(data) {
    const result = await pool.request()
        .input("UserID", data.userId)
        .input("LicenseNumber", data.licenseNumber)
        .input("LicenseType", data.licenseType || null)
        .input("LicenseExpiry", data.licenseExpiry || null)
        .query(`
            INSERT INTO Drivers (UserID, LicenseNumber, LicenseType, LicenseExpiry)
            OUTPUT INSERTED.*
            VALUES (@UserID, @LicenseNumber, @LicenseType, @LicenseExpiry)
        `);
    return result.recordset[0];
}

async function update(driverId, data) {
    const fields = [];
    const request = pool.request();
    request.input("DriverID", driverId);

    if (data.licenseNumber !== undefined) { fields.push("LicenseNumber = @LicenseNumber"); request.input("LicenseNumber", data.licenseNumber); }
    if (data.licenseType !== undefined) { fields.push("LicenseType = @LicenseType"); request.input("LicenseType", data.licenseType); }
    if (data.licenseExpiry !== undefined) { fields.push("LicenseExpiry = @LicenseExpiry"); request.input("LicenseExpiry", data.licenseExpiry); }
    if (data.status !== undefined) { fields.push("Status = @Status"); request.input("Status", data.status); }
    if (data.latitude !== undefined) { fields.push("CurrentLatitude = @Lat"); request.input("Lat", data.latitude); }
    if (data.longitude !== undefined) { fields.push("CurrentLongitude = @Lng"); request.input("Lng", data.longitude); }

    if (fields.length === 0) return null;
    fields.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
        UPDATE Drivers SET ${fields.join(", ")}
        OUTPUT INSERTED.*
        WHERE DriverID = @DriverID
    `);
    return result.recordset[0] || null;
}

async function updateLocation(driverId, latitude, longitude) {
    await pool.request()
        .input("DriverID", driverId)
        .input("Lat", latitude)
        .input("Lng", longitude)
        .query("UPDATE Drivers SET CurrentLatitude = @Lat, CurrentLongitude = @Lng, UpdatedAt = GETDATE() WHERE DriverID = @DriverID");

    await pool.request()
        .input("DriverID", driverId)
        .input("Lat", latitude)
        .input("Lng", longitude)
        .query("INSERT INTO DriverLocations (DriverID, Latitude, Longitude) VALUES (@DriverID, @Lat, @Lng)");
}

async function findByUserId(userId) {
    const result = await pool.request()
        .input("UserID", userId)
        .query(`
            SELECT d.*, u.FullName, u.Email, u.Phone, u.Username,
                   v.VehicleID, v.LicensePlate, v.VehicleType
            FROM Drivers d
            JOIN Users u ON d.UserID = u.UserID
            LEFT JOIN Vehicles v ON d.DriverID = v.DriverID
            WHERE d.UserID = @UserID
        `);
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, findByUserId, create, update, updateLocation };
