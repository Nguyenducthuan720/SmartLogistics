const pool = require("../../config/database");

async function findAll({ offset, limit, search }) {
    let where = "";
    const request = pool.request();
    if (search) { where = "WHERE (c.CompanyName LIKE @Search OR c.ContactPerson LIKE @Search)"; request.input("Search", `%${search}%`); }
    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Customers c ${where}`);
    const total = countResult.recordset[0].total;
    request.input("Offset", offset); request.input("Limit", limit);
    const dataResult = await request.query(`
        SELECT c.*, u.FullName, u.Email, u.Phone AS UserPhone, u.Username
        FROM Customers c JOIN Users u ON c.UserID = u.UserID ${where}
        ORDER BY c.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return { data: dataResult.recordset, total };
}

async function findById(customerId) {
    const result = await pool.request().input("CustomerID", customerId).query(`
        SELECT c.*, u.FullName, u.Email, u.Phone AS UserPhone, u.Username
        FROM Customers c JOIN Users u ON c.UserID = u.UserID WHERE c.CustomerID = @CustomerID
    `);
    return result.recordset[0] || null;
}

async function findByUserId(userId) {
    const result = await pool.request().input("UserID", userId).query(`
        SELECT c.*, u.FullName, u.Email, u.Phone AS UserPhone, u.Username
        FROM Customers c JOIN Users u ON c.UserID = u.UserID WHERE c.UserID = @UserID
    `);
    return result.recordset[0] || null;
}

async function create(data) {
    const result = await pool.request()
        .input("UserID", data.userId).input("CompanyName", data.companyName || null)
        .input("TaxCode", data.taxCode || null).input("ContactPerson", data.contactPerson || null)
        .input("CustomerType", data.customerType || "INDIVIDUAL")
        .query(`INSERT INTO Customers (UserID, CompanyName, TaxCode, ContactPerson, CustomerType) OUTPUT INSERTED.* VALUES (@UserID, @CompanyName, @TaxCode, @ContactPerson, @CustomerType)`);
    return result.recordset[0];
}

async function update(customerId, data) {
    const fields = []; const request = pool.request(); request.input("CustomerID", customerId);
    if (data.companyName !== undefined) { fields.push("CompanyName = @CompanyName"); request.input("CompanyName", data.companyName); }
    if (data.taxCode !== undefined) { fields.push("TaxCode = @TaxCode"); request.input("TaxCode", data.taxCode); }
    if (data.contactPerson !== undefined) { fields.push("ContactPerson = @ContactPerson"); request.input("ContactPerson", data.contactPerson); }
    if (data.customerType !== undefined) { fields.push("CustomerType = @CustomerType"); request.input("CustomerType", data.customerType); }
    if (fields.length === 0) return null;
    fields.push("UpdatedAt = GETDATE()");
    const result = await request.query(`UPDATE Customers SET ${fields.join(", ")} OUTPUT INSERTED.* WHERE CustomerID = @CustomerID`);
    return result.recordset[0] || null;
}

async function ensureCustomerProfile(userId) {
    const existing = await findByUserId(userId);
    if (existing) return existing;
    return create({ userId });
}

module.exports = { findAll, findById, findByUserId, create, update, ensureCustomerProfile };
