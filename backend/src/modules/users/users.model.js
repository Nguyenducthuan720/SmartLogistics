const pool = require("../../config/database");

async function findAll({ page, limit, offset, search }) {
    let whereClause = "";
    const inputs = {};

    if (search) {
        whereClause = "WHERE (u.FullName LIKE @Search OR u.Email LIKE @Search OR u.Username LIKE @Search)";
        inputs.Search = `%${search}%`;
    }

    const countResult = await pool.request()
        .input("Search", inputs.Search || null)
        .query(`SELECT COUNT(*) AS total FROM Users u ${whereClause}`);

    const total = countResult.recordset[0].total;

    const dataResult = await pool.request()
        .input("Search", inputs.Search || null)
        .input("Offset", offset)
        .input("Limit", limit)
        .query(`
            SELECT u.UserID, u.Username, u.Email, u.FullName, u.Phone, u.Avatar,
                   u.Gender, u.DateOfBirth, u.Address, u.IsVerified, u.IsLocked,
                   u.IsActive, u.LastLogin, u.CreatedAt, u.UpdatedAt,
                   r.RoleID, r.RoleName AS Role
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            ${whereClause}
            ORDER BY u.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
        `);

    return { data: dataResult.recordset, total };
}

async function findById(userId) {
    const result = await pool.request()
        .input("UserID", userId)
        .query(`
            SELECT u.UserID, u.Username, u.Email, u.FullName, u.Phone, u.Avatar,
                   u.Gender, u.DateOfBirth, u.Address, u.IsVerified, u.IsLocked,
                   u.IsActive, u.LastLogin, u.CreatedAt, u.UpdatedAt,
                   r.RoleID, r.RoleName AS Role
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.UserID = @UserID
        `);
    return result.recordset[0] || null;
}

async function update(userId, updateData) {
    const fields = [];
    const request = pool.request();
    request.input("UserID", userId);

    if (updateData.fullName !== undefined) {
        fields.push("FullName = @FullName");
        request.input("FullName", updateData.fullName);
    }
    if (updateData.phone !== undefined) {
        fields.push("Phone = @Phone");
        request.input("Phone", updateData.phone);
    }
    if (updateData.avatar !== undefined) {
        fields.push("Avatar = @Avatar");
        request.input("Avatar", updateData.avatar);
    }
    if (updateData.gender !== undefined) {
        fields.push("Gender = @Gender");
        request.input("Gender", updateData.gender);
    }
    if (updateData.dateOfBirth !== undefined) {
        fields.push("DateOfBirth = @DateOfBirth");
        request.input("DateOfBirth", updateData.dateOfBirth);
    }
    if (updateData.address !== undefined) {
        fields.push("Address = @Address");
        request.input("Address", updateData.address);
    }
    if (updateData.roleId !== undefined) {
        fields.push("RoleID = @RoleID");
        request.input("RoleID", updateData.roleId);
    }
    if (updateData.isActive !== undefined) {
        fields.push("IsActive = @IsActive");
        request.input("IsActive", updateData.isActive ? 1 : 0);
    }
    if (updateData.isLocked !== undefined) {
        fields.push("IsLocked = @IsLocked");
        request.input("IsLocked", updateData.isLocked ? 1 : 0);
    }

    if (fields.length === 0) return null;

    fields.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
        UPDATE Users
        SET ${fields.join(", ")}
        OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.Email, INSERTED.FullName, INSERTED.Phone,
               INSERTED.Avatar, INSERTED.Gender, INSERTED.DateOfBirth, INSERTED.Address,
               INSERTED.IsVerified, INSERTED.IsLocked, INSERTED.IsActive, INSERTED.UpdatedAt
        WHERE UserID = @UserID
    `);

    return result.recordset[0] || null;
}

async function remove(userId) {
    const result = await pool.request()
        .input("UserID", userId)
        .query("UPDATE Users SET IsActive = 0, UpdatedAt = GETDATE() WHERE UserID = @UserID");
    return result.rowsAffected[0] > 0;
}

module.exports = { findAll, findById, update, remove };
