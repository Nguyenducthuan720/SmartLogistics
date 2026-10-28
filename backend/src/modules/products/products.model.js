const pool = require("../../config/database");

async function findAll({ offset, limit, categoryId, search }) {
    let where = [];
    const request = pool.request();

    if (categoryId) { where.push("p.CategoryID = @CID"); request.input("CID", categoryId); }
    if (search) { where.push("(p.ProductName LIKE @Search OR p.ProductCode LIKE @Search)"); request.input("Search", `%${search}%`); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Products p ${whereClause}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT p.*, c.CategoryName
        FROM Products p
        JOIN Categories c ON p.CategoryID = c.CategoryID
        ${whereClause}
        ORDER BY p.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return { data: dataResult.recordset, total };
}

async function findById(id) {
    const result = await pool.request().input("ProductID", id)
        .query("SELECT p.*, c.CategoryName FROM Products p JOIN Categories c ON p.CategoryID = c.CategoryID WHERE p.ProductID = @ProductID");
    return result.recordset[0] || null;
}

async function create(data) {
    const result = await pool.request()
        .input("CategoryID", data.categoryId)
        .input("ProductCode", data.productCode || null)
        .input("ProductName", data.productName)
        .input("Description", data.description || null)
        .input("Weight", data.weight || null)
        .input("Length", data.length || null)
        .input("Width", data.width || null)
        .input("Height", data.height || null)
        .input("Unit", data.unit || null)
        .input("Price", data.price || null)
        .input("ImageUrl", data.imageUrl || null)
        .query(`
            INSERT INTO Products (CategoryID, ProductCode, ProductName, Description, Weight, Length, Width, Height, Unit, Price, ImageUrl)
            OUTPUT INSERTED.*
            VALUES (@CategoryID, @ProductCode, @ProductName, @Description, @Weight, @Length, @Width, @Height, @Unit, @Price, @ImageUrl)
        `);
    return result.recordset[0];
}

async function update(id, data) {
    const fields = [];
    const request = pool.request();
    request.input("ProductID", id);
    const map = {
        categoryId: "CategoryID", productCode: "ProductCode", productName: "ProductName",
        description: "Description", weight: "Weight", length: "Length", width: "Width",
        height: "Height", unit: "Unit", price: "Price", imageUrl: "ImageUrl", isActive: "IsActive"
    };
    for (const [key, col] of Object.entries(map)) {
        if (data[key] !== undefined) {
            fields.push(`${col} = @${col}`);
            request.input(col, data[key]);
        }
    }
    if (fields.length === 0) return null;
    const result = await request.query(`UPDATE Products SET ${fields.join(", ")} OUTPUT INSERTED.* WHERE ProductID = @ProductID`);
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, update };
