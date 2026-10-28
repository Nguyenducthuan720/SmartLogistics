const pool = require("../../config/database");

async function getOrderReport({ startDate, endDate }) {
    let where = "";
    const request = pool.request();

    if (startDate) { where += " AND o.CreatedAt >= @StartDate"; request.input("StartDate", startDate); }
    if (endDate) { where += " AND o.CreatedAt <= @EndDate"; request.input("EndDate", endDate); }

    const result = await request.query(`
        SELECT OrderStatus, COUNT(*) AS Count, SUM(TotalAmount) AS Revenue
        FROM Orders o
        WHERE 1=1 ${where}
        GROUP BY OrderStatus
        ORDER BY OrderStatus
    `);
    return result.recordset;
}

async function getRevenueByMonth() {
    const result = await pool.request().query(`
        SELECT FORMAT(CreatedAt, 'yyyy-MM') AS Month,
               COUNT(*) AS TotalOrders,
               SUM(TotalAmount) AS Revenue
        FROM Orders
        GROUP BY FORMAT(CreatedAt, 'yyyy-MM')
        ORDER BY Month DESC
    `);
    return result.recordset;
}

async function getDriverPerformance() {
    const result = await pool.request().query(`
        SELECT u.FullName AS DriverName, d.TotalTrips, d.Rating,
               COUNT(s.ShipmentID) AS CompletedShipments,
               AVG(DATEDIFF(MINUTE, s.StartTime, s.ActualArrival)) AS AvgDeliveryMinutes
        FROM Drivers d
        JOIN Users u ON d.UserID = u.UserID
        LEFT JOIN Shipments s ON d.DriverID = s.DriverID AND s.ShipmentStatus = 'DELIVERED'
        GROUP BY u.FullName, d.TotalTrips, d.Rating
        ORDER BY CompletedShipments DESC
    `);
    return result.recordset;
}

module.exports = { getOrderReport, getRevenueByMonth, getDriverPerformance };
