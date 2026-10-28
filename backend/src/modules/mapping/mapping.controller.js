const service = require("./mapping.service");
const { success, badRequest, notFound } = require("../../utils/response");
const logger = require("../../utils/logger");

async function geocode(req, res, next) {
    try {
        const address = (req.query.address || "").trim();
        if (!address) return badRequest(res, "address query parameter is required");

        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 6));
        const results = await service.geocode(address, limit);

        if (results.length === 0) return notFound(res, "No address found for the given query");
        return success(res, results, "Addresses geocoded");
    } catch (err) {
        logger.error("Geocoding failed", { error: err.message });
        next(err);
    }
}

async function reverseGeocode(req, res, next) {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return badRequest(res, "lat and lng query parameters are required");
        }

        const result = await service.reverseGeocode(lat, lng);
        if (!result) return notFound(res, "No address found for the given coordinates");

        return success(res, result, "Address resolved");
    } catch (err) {
        logger.error("Reverse geocoding failed", { error: err.message });
        next(err);
    }
}

async function getRoute(req, res, next) {
    try {
        const pickupLat = parseFloat(req.query.pickupLat);
        const pickupLng = parseFloat(req.query.pickupLng);
        const deliveryLat = parseFloat(req.query.deliveryLat);
        const deliveryLng = parseFloat(req.query.deliveryLng);

        if ([pickupLat, pickupLng, deliveryLat, deliveryLng].some(Number.isNaN)) {
            return badRequest(res, "pickupLat, pickupLng, deliveryLat and deliveryLng query parameters are required");
        }

        const result = await service.getRoute(pickupLat, pickupLng, deliveryLat, deliveryLng);
        return success(res, result, "Road route resolved");
    } catch (err) {
        logger.error("Route resolution failed", { error: err.message });
        next(err);
    }
}

module.exports = { geocode, reverseGeocode, getRoute };
