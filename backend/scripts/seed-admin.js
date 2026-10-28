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

async function seedAdmin() {
    try {
        const pool = await sql.connect(config);
        console.log("Connected to SQL Server");

        const hash = await bcrypt.hash("admin123", 10);

        const existing = await pool.request()
            .input("Email", "admin@smartlogistics.com")
            .query("SELECT UserID FROM Users WHERE Email = @Email");

        if (existing.recordset.length > 0) {
            await pool.request()
                .input("Email", "admin@smartlogistics.com")
                .input("PasswordHash", hash)
                .query("UPDATE Users SET PasswordHash = @PasswordHash WHERE Email = @Email");
            console.log("Admin user password updated");
        } else {
            await pool.request()
                .input("RoleID", 1)
                .input("FullName", "System Admin")
                .input("Username", "admin")
                .input("Email", "admin@smartlogistics.com")
                .input("PasswordHash", hash)
                .query(`
                    INSERT INTO Users (RoleID, FullName, Username, Email, PasswordHash)
                    VALUES (@RoleID, @FullName, @Username, @Email, @PasswordHash)
                `);
            console.log("Admin user created");
        }

        await pool.close();
        console.log("Done!");
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

seedAdmin();
