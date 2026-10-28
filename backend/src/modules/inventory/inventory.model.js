const pool = require("../../config/database");

async function findAll({ offset, limit, warehouseId, productId }) {
    let where = [];
    const request = pool.request();

    if (warehouseId) { where.push("i.WarehouseID = @WID"); request.input("WID", warehouseId); }
    if (productId) { where.push("i.ProductID = @PID"); request.input("PID", productId); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Inventory i ${whereClause}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT i.*, w.WarehouseName, wz.ZoneName, p.ProductName, p.ProductCode, p.ImageUrl
        FROM Inventory i
        JOIN Warehouses w ON i.WarehouseID = w.WarehouseID
        LEFT JOIN WarehouseZones wz ON i.ZoneID = wz.ZoneID
        JOIN Products p ON i.ProductID = p.ProductID
        ${whereClause}
        ORDER BY w.WarehouseName, p.ProductName
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

    return { data: dataResult.recordset, total };
}

async function update(id, data) {
    const fields = [];
    const request = pool.request();
    request.input("InventoryID", id);

    if (data.quantity !== undefined) { fields.push("Quantity = @Quantity"); request.input("Quantity", data.quantity); }
    if (data.reservedQuantity !== undefined) { fields.push("ReservedQuantity = @ReservedQuantity"); request.input("ReservedQuantity", data.reservedQuantity); }

    if (fields.length === 0) return null;
    fields.push("LastUpdated = GETDATE()");

    const result = await request.query(`
        UPDATE Inventory SET ${fields.join(", ")}
        OUTPUT INSERTED.*
        WHERE InventoryID = @InventoryID
    `);
    return result.recordset[0] || null;
}

module.exports = { findAll, update };
