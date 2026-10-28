const pool = require("../../config/database");

async function getRoutes() {
    const result = await pool.request().query("SELECT * FROM Routes ORDER BY DistanceKM");
    return result.recordset;
}

async function getShipmentHistory() {
    const result = await pool.request().query(`
        SELECT s.ShipmentID, s.StartTime, s.ActualArrival,
               r.DistanceKM, r.RouteCode,
               DATEDIFF(MINUTE, s.StartTime, s.ActualArrival) AS ActualMinutes
        FROM Shipments s
        JOIN Routes r ON s.RouteID = r.RouteID
        WHERE s.StartTime IS NOT NULL AND s.ActualArrival IS NOT NULL
        ORDER BY s.StartTime DESC
    `);
    return result.recordset;
}

async function getShipmentRouteInfo(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query(`
            SELECT s.ShipmentID, s.RouteID, s.VehicleID, r.DistanceKM, r.RouteCode, v.VehicleType
            FROM Shipments s
            LEFT JOIN Routes r ON s.RouteID = r.RouteID
            LEFT JOIN Vehicles v ON s.VehicleID = v.VehicleID
            WHERE s.ShipmentID = @ShipmentID
        `);
    return result.recordset[0] || null;
}

async function savePrediction(data) {
    const result = await pool.request()
        .input("ShipmentID", data.shipmentId)
        .input("PredictedETA", data.predictedETA)
        .input("PredictedDistance", data.predictedDistance || null)
        .input("TrafficLevel", data.trafficLevel || null)
        .input("Weather", data.weather || null)
        .input("ConfidenceScore", data.confidenceScore || null)
        .input("ModelVersion", data.modelVersion || "V1")
        .query(`
            INSERT INTO AI_Predictions (ShipmentID, PredictedETA, PredictedDistance, TrafficLevel, Weather, ConfidenceScore, ModelVersion)
            OUTPUT INSERTED.*
            VALUES (@ShipmentID, @PredictedETA, @PredictedDistance, @TrafficLevel, @Weather, @ConfidenceScore, @ModelVersion)
        `);
    return result.recordset[0];
}

async function getPredictions(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query("SELECT * FROM AI_Predictions WHERE ShipmentID = @ShipmentID ORDER BY CreatedAt DESC");
    return result.recordset;
}

module.exports = { getRoutes, getShipmentHistory, getShipmentRouteInfo, savePrediction, getPredictions };
