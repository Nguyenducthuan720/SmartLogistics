const pool = require("../../config/database");

async function findAll() {
    const result = await pool.request().query("SELECT * FROM Roles ORDER BY RoleID");
    return result.recordset;
}

async function findById(roleId) {
    const result = await pool.request()
        .input("RoleID", roleId)
        .query("SELECT * FROM Roles WHERE RoleID = @RoleID");
    return result.recordset[0] || null;
}

async function create({ roleName, description }) {
    const result = await pool.request()
        .input("RoleName", roleName)
        .input("Description", description || null)
        .query(`
            INSERT INTO Roles (RoleName, Description)
            OUTPUT INSERTED.*
            VALUES (@RoleName, @Description)
        `);
    return result.recordset[0];
}

async function update(roleId, { roleName, description, isActive }) {
    const fields = [];
    const request = pool.request();
    request.input("RoleID", roleId);

    if (roleName !== undefined) {
        fields.push("RoleName = @RoleName");
        request.input("RoleName", roleName);
    }
    if (description !== undefined) {
        fields.push("Description = @Description");
        request.input("Description", description);
    }
    if (isActive !== undefined) {
        fields.push("IsActive = @IsActive");
        request.input("IsActive", isActive ? 1 : 0);
    }

    if (fields.length === 0) return null;
    fields.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
        UPDATE Roles SET ${fields.join(", ")}
        OUTPUT INSERTED.*
        WHERE RoleID = @RoleID
    `);
    return result.recordset[0] || null;
}

async function assignPermissions(roleId, permissionIds) {
    const request = pool.request();
    request.input("RoleID", roleId);

    await request.query("DELETE FROM RolePermissions WHERE RoleID = @RoleID");

    if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map((pid, i) => {
            request.input(`P${i}`, pid);
            return `(@RoleID, @P${i})`;
        }).join(", ");

        await request.query(`INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ${values}`);
    }
}

async function getRolePermissions(roleId) {
    const result = await pool.request()
        .input("RoleID", roleId)
        .query(`
            SELECT p.* FROM Permissions p
            JOIN RolePermissions rp ON p.PermissionID = rp.PermissionID
            WHERE rp.RoleID = @RoleID
            ORDER BY p.ModuleName, p.PermissionName
        `);
    return result.recordset;
}

module.exports = { findAll, findById, create, update, assignPermissions, getRolePermissions };
