const pool = require("../../config/database");

async function findByUser(userId, { offset, limit }) {
    const countResult = await pool.request()
        .input("UserID", userId)
        .query("SELECT COUNT(*) AS total FROM Notifications WHERE UserID = @UserID");
    const total = countResult.recordset[0].total;

    const dataResult = await pool.request()
        .input("UserID", userId)
        .input("Offset", offset)
        .input("Limit", limit)
        .query(`
            SELECT * FROM Notifications
            WHERE UserID = @UserID
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
        `);
    return { data: dataResult.recordset, total };
}

async function create(data) {
    const result = await pool.request()
        .input("UserID", data.userId)
        .input("Title", data.title)
        .input("Message", data.message)
        .input("Type", data.type || "SYSTEM")
        .query(`
            INSERT INTO Notifications (UserID, Title, Message, Type)
            OUTPUT INSERTED.*
            VALUES (@UserID, @Title, @Message, @Type)
        `);
    return result.recordset[0];
}

async function markAsRead(notificationId) {
    await pool.request()
        .input("NotificationID", notificationId)
        .query("UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID");
}

async function markAllAsRead(userId) {
    await pool.request()
        .input("UserID", userId)
        .query("UPDATE Notifications SET IsRead = 1 WHERE UserID = @UserID AND IsRead = 0");
}

module.exports = { findByUser, create, markAsRead, markAllAsRead };
