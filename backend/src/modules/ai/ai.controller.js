const service = require("./ai.service");
const { success, notFound, badRequest } = require("../../utils/response");
const logger = require("../../utils/logger");

async function optimizeRoute(req, res, next) {
    try {
        const { pickupLat, pickupLng, deliveryLat, deliveryLng } = req.body;
        if (!pickupLat || !pickupLng || !deliveryLat || !deliveryLng) {
            return notFound(res, "Missing coordinates (pickupLat, pickupLng, deliveryLat, deliveryLng)");
        }
        const result = await service.optimizeRoute(
            parseFloat(pickupLat), parseFloat(pickupLng),
            parseFloat(deliveryLat), parseFloat(deliveryLng)
        );
        return success(res, result, "Route optimized");
    } catch (err) { logger.error("Route optimization failed", { error: err.message }); next(err); }
}

async function predictETA(req, res, next) {
    try {
        const result = await service.predictETA(parseInt(req.params.shipmentId));
        return success(res, result, "ETA predicted");
    } catch (err) { logger.error("ETA prediction failed", { error: err.message }); next(err); }
}

async function getPredictionHistory(req, res, next) {
    try {
        const history = await service.getPredictionHistory(parseInt(req.params.shipmentId));
        return success(res, history);
    } catch (err) { next(err); }
}

async function predictDeliveryTime(req, res, next) {
    try {
        const { distanceKm, vehicleType, traffic, weather } = req.body;
        if (!distanceKm) return notFound(res, "distanceKm is required");
        const result = await service.predictDeliveryTime(
            parseFloat(distanceKm),
            vehicleType || "truck",
            traffic || "medium",
            weather || "clear"
        );
        return success(res, result, "Delivery time estimated");
    } catch (err) { next(err); }
}

async function shipmentRoute(req, res, next) {
    try {
        const result = await service.shipmentRoute(parseInt(req.params.shipmentId));
        return success(res, result, "Shipment route resolved");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 400) return badRequest(res, err.message);
        next(err);
    }
}

module.exports = { optimizeRoute, predictETA, getPredictionHistory, predictDeliveryTime, shipmentRoute };
