const pool = require("../../config/database");

async function findAll({ offset, limit, status, customerId, search }) {
    let where = [];
    const request = pool.request();

    if (status) { where.push("o.OrderStatus = @Status"); request.input("Status", status); }
    if (customerId) { where.push("o.CustomerID = @CustomerID"); request.input("CustomerID", customerId); }
    if (search) { where.push("(o.OrderCode LIKE @Search)"); request.input("Search", `%${search}%`); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await request.query(`SELECT COUNT(*) AS total FROM Orders o ${whereClause}`);
    const total = countResult.recordset[0].total;

    request.input("Offset", offset);
    request.input("Limit", limit);

    const dataResult = await request.query(`
        SELECT o.*, c.CompanyName, c.ContactPerson,
               u.FullName AS CustomerName, u.Email AS CustomerEmail, u.Phone AS CustomerPhone
        FROM Orders o
        JOIN Customers c ON o.CustomerID = c.CustomerID
        JOIN Users u ON c.UserID = u.UserID
        ${whereClause}
        ORDER BY o.CreatedAt DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

    return { data: dataResult.recordset, total };
}

async function findById(orderId) {
    const orderResult = await pool.request()
        .input("OrderID", orderId)
        .query(`
            SELECT o.*, c.CompanyName, c.ContactPerson,
                   u.FullName AS CustomerName, u.Email AS CustomerEmail, u.Phone AS CustomerPhone,
                   s.ShipmentID, s.DriverID AS ShipmentDriverID, s.ShipmentStatus
            FROM Orders o
            JOIN Customers c ON o.CustomerID = c.CustomerID
            JOIN Users u ON c.UserID = u.UserID
            LEFT JOIN Shipments s ON o.OrderID = s.OrderID
            WHERE o.OrderID = @OrderID
        `);

    const order = orderResult.recordset[0];
    if (!order) return null;

    const itemsResult = await pool.request()
        .input("OrderID", orderId)
        .query(`
            SELECT oi.*, p.ProductName, p.ProductCode, p.ImageUrl
            FROM OrderItems oi
            JOIN Products p ON oi.ProductID = p.ProductID
            WHERE oi.OrderID = @OrderID
        `);

    order.items = itemsResult.recordset;
    return order;
}

async function create({ customerId, pickupAddress, deliveryAddress, pickupProvince, deliveryProvince, items }) {
    const orderCode = "ORD" + Date.now().toString(36).toUpperCase();

    const result = await pool.request()
        .input("OrderCode", orderCode)
        .input("CustomerID", customerId)
        .input("PickupAddress", pickupAddress || null)
        .input("DeliveryAddress", deliveryAddress || null)
        .input("PickupProvince", pickupProvince || null)
        .input("DeliveryProvince", deliveryProvince || null)
        .query(`
            DECLARE @NewOrder TABLE (OrderID INT, OrderCode NVARCHAR(30), CustomerID INT, PickupAddress NVARCHAR(255), DeliveryAddress NVARCHAR(255), PickupProvince NVARCHAR(100), DeliveryProvince NVARCHAR(100), OrderStatus NVARCHAR(30), TotalWeight DECIMAL(10,2), TotalAmount DECIMAL(18,2), CreatedAt DATETIME2, UpdatedAt DATETIME2);

            INSERT INTO Orders (OrderCode, CustomerID, PickupAddress, DeliveryAddress, PickupProvince, DeliveryProvince)
            OUTPUT INSERTED.OrderID, INSERTED.OrderCode, INSERTED.CustomerID, INSERTED.PickupAddress, INSERTED.DeliveryAddress, INSERTED.PickupProvince, INSERTED.DeliveryProvince, INSERTED.OrderStatus, INSERTED.TotalWeight, INSERTED.TotalAmount, INSERTED.CreatedAt, INSERTED.UpdatedAt INTO @NewOrder
            VALUES (@OrderCode, @CustomerID, @PickupAddress, @DeliveryAddress, @PickupProvince, @DeliveryProvince);

            SELECT * FROM @NewOrder;
        `);

    const order = result.recordset[0];
    if (!order) throw new Error("Failed to create order");

    if (items && items.length > 0) {
        let totalWeight = 0;
        let totalAmount = 0;
        const itemRequest = pool.request();
        itemRequest.input("OrderID", order.OrderID);

        const values = items.map((item, i) => {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);
            const weight = Number(item.weight) || 0;
            const price = Number(item.price) || 0;

            if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
                throw Object.assign(new Error("Each item requires a valid productId and positive quantity"), { statusCode: 400 });
            }

            itemRequest.input(`Q${i}`, quantity);
            itemRequest.input(`P${i}`, productId);
            itemRequest.input(`W${i}`, weight);
            itemRequest.input(`Price${i}`, price);
            totalWeight += weight * quantity;
            totalAmount += price * quantity;
            return `(@OrderID, @P${i}, @Q${i}, @W${i}, @Price${i})`;
        }).join(", ");

        await itemRequest.query(`
            INSERT INTO OrderItems (OrderID, ProductID, Quantity, Weight, Price)
            VALUES ${values}
        `);

        await pool.request()
            .input("OrderID", order.OrderID)
            .input("TotalWeight", totalWeight)
            .input("TotalAmount", totalAmount)
            .query("UPDATE Orders SET TotalWeight = @TotalWeight, TotalAmount = @TotalAmount WHERE OrderID = @OrderID");
    }

    return order;
}

async function updateStatus(orderId, status) {
    await pool.request()
        .input("OrderID", orderId)
        .input("OrderStatus", status)
        .query("UPDATE Orders SET OrderStatus = @OrderStatus, UpdatedAt = GETDATE() WHERE OrderID = @OrderID");

    const result = await pool.request()
        .input("OrderID", orderId)
        .query("SELECT * FROM Orders WHERE OrderID = @OrderID");
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, updateStatus };
