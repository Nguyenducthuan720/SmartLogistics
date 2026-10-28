require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER || "localhost",
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || "SmartLogistics",
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "123456",
    options: { encrypt: false, trustServerCertificate: true }
};

async function seed() {
    try {
        const pool = await sql.connect(config);
        console.log("Connected");

        const hash = await bcrypt.hash("driver123", 10);

        const existing = await pool.request().input("Email", "driver@smartlogistics.com").query("SELECT UserID FROM Users WHERE Email = @Email");

        let userId;
        if (existing.recordset.length > 0) {
            userId = existing.recordset[0].UserID;
            await pool.request().input("UserID", userId).input("FullName", "Nguyen Van Tai").input("PasswordHash", hash).query("UPDATE Users SET FullName = @FullName, PasswordHash = @PasswordHash, RoleID = 3 WHERE UserID = @UserID");
            console.log("Driver user updated, UserID:", userId);
        } else {
            const r = await pool.request()
                .input("RoleID", 3).input("FullName", "Nguyen Van Tai").input("Username", "driver1")
                .input("Email", "driver@smartlogistics.com").input("PasswordHash", hash)
                .query("INSERT INTO Users (RoleID, FullName, Username, Email, PasswordHash) OUTPUT INSERTED.UserID VALUES (@RoleID, @FullName, @Username, @Email, @PasswordHash)");
            userId = r.recordset[0].UserID;
            console.log("Driver user created, UserID:", userId);
        }

        const drv = await pool.request().input("UserID", userId).query("SELECT DriverID FROM Drivers WHERE UserID = @UserID");
        if (drv.recordset.length === 0) {
            await pool.request().input("UserID", userId).input("LicenseNumber", "B2-DRIVER01").input("LicenseType", "B2").query("INSERT INTO Drivers (UserID, LicenseNumber, LicenseType, Status) VALUES (@UserID, @LicenseNumber, @LicenseType, 'AVAILABLE')");
            console.log("Driver profile created");
        }

        const veh = await pool.request().input("UserId", userId).query("SELECT v.VehicleID FROM Vehicles v JOIN Drivers d ON v.DriverID = d.DriverID WHERE d.UserID = @UserId");
        if (veh.recordset.length === 0) {
            const vehResult = await pool.request().input("LicensePlate", "51A-DR001").query("INSERT INTO Vehicles (LicensePlate, VehicleType, Brand, CapacityWeight) OUTPUT INSERTED.VehicleID VALUES (@LicensePlate, 'Truck', 'Hyundai', 5000)");
            const vehId = vehResult.recordset[0].VehicleID;
            const drvId = (await pool.request().input("UserID", userId).query("SELECT DriverID FROM Drivers WHERE UserID = @UserID")).recordset[0].DriverID;
            await pool.request().input("VehicleID", vehId).input("DriverID", drvId).query("UPDATE Vehicles SET DriverID = @DriverID WHERE VehicleID = @VehicleID");
            console.log("Vehicle assigned to driver");
        }

        await pool.close();
        console.log("Done! Login: driver@smartlogistics.com / driver123");
    } catch (err) { console.error("Error:", err.message); process.exit(1); }
}

seed();
