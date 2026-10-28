require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const sql = require("mssql");
const config = {
    server: process.env.DB_SERVER || "localhost", port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || "SmartLogistics", user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "123456", options: { encrypt: false, trustServerCertificate: true }
};

async function seed() {
    try {
        const pool = await sql.connect(config);
        const hash = await bcrypt.hash("customer123", 10);
        const existing = await pool.request().input("Email", "customer@smartlogistics.com").query("SELECT UserID FROM Users WHERE Email = @Email");

        let userId;
        if (existing.recordset.length > 0) {
            userId = existing.recordset[0].UserID;
            await pool.request().input("UserID", userId).input("PasswordHash", hash).query("UPDATE Users SET PasswordHash = @PasswordHash, RoleID = 4 WHERE UserID = @UserID");
        } else {
            const r = await pool.request().input("RoleID", 4).input("FullName", "Nguyen Khach Hang").input("Username", "customer1").input("Email", "customer@smartlogistics.com").input("PasswordHash", hash).query("INSERT INTO Users (RoleID, FullName, Username, Email, PasswordHash) OUTPUT INSERTED.UserID VALUES (@RoleID, @FullName, @Username, @Email, @PasswordHash)");
            userId = r.recordset[0].UserID;
        }

        const c = await pool.request().input("UserID", userId).query("SELECT CustomerID FROM Customers WHERE UserID = @UserID");
        if (c.recordset.length === 0) {
            await pool.request().input("UserID", userId).input("ContactPerson", "Nguyen Khach Hang").input("CustomerType", "INDIVIDUAL").query("INSERT INTO Customers (UserID, ContactPerson, CustomerType) VALUES (@UserID, @ContactPerson, @CustomerType)");
        }

        await pool.close();
        console.log("Done! Login: customer@smartlogistics.com / customer123");
    } catch (err) { console.error(err); process.exit(1); }
}
seed();
