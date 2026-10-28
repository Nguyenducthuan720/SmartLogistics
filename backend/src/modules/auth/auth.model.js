const pool = require("../../config/database");

async function findUserByEmail(email) {
    const result = await pool.request()
        .input("Email", email)
        .query(`
            SELECT u.*, r.RoleName AS Role
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.Email = @Email AND u.IsActive = 1
        `);
    return result.recordset[0] || null;
}

async function findUserByUsername(username) {
    const result = await pool.request()
        .input("Username", username)
        .query(`
            SELECT u.*, r.RoleName AS Role
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.Username = @Username AND u.IsActive = 1
        `);
    return result.recordset[0] || null;
}

async function findUserById(userId) {
    const result = await pool.request()
        .input("UserID", userId)
        .query(`
            SELECT u.*, r.RoleName AS Role
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.UserID = @UserID AND u.IsActive = 1
        `);
    return result.recordset[0] || null;
}

async function createUser(userData) {
    const result = await pool.request()
        .input("RoleID", 4) // Customer role by default
        .input("FullName", userData.fullName)
        .input("Username", userData.username)
        .input("Email", userData.email)
        .input("PasswordHash", userData.passwordHash)
        .input("Phone", userData.phone || null)
        .query(`
            INSERT INTO Users (RoleID, FullName, Username, Email, PasswordHash, Phone)
            OUTPUT INSERTED.UserID, INSERTED.Email, INSERTED.Username, INSERTED.FullName
            VALUES (@RoleID, @FullName, @Username, @Email, @PasswordHash, @Phone)
        `);
    return result.recordset[0];
}

async function updateLastLogin(userId) {
    await pool.request()
        .input("UserID", userId)
        .query("UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID");
}

async function saveRefreshToken(userId, token, expiredAt) {
    await pool.request()
        .input("UserID", userId)
        .input("Token", token)
        .input("ExpiredAt", expiredAt)
        .query(`
            INSERT INTO RefreshTokens (UserID, Token, ExpiredAt)
            VALUES (@UserID, @Token, @ExpiredAt)
        `);
}

async function findRefreshToken(token) {
    const result = await pool.request()
        .input("Token", token)
        .query(`
            SELECT * FROM RefreshTokens
            WHERE Token = @Token AND IsRevoked = 0 AND ExpiredAt > GETDATE()
        `);
    return result.recordset[0] || null;
}

async function revokeRefreshToken(token) {
    await pool.request()
        .input("Token", token)
        .query("UPDATE RefreshTokens SET IsRevoked = 1 WHERE Token = @Token");
}

async function revokeAllUserTokens(userId) {
    await pool.request()
        .input("UserID", userId)
        .query("UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID AND IsRevoked = 0");
}

module.exports = {
    findUserByEmail,
    findUserByUsername,
    findUserById,
    createUser,
    updateLastLogin,
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
};
