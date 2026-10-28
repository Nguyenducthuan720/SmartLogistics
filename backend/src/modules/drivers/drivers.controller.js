const service = require("./drivers.service");
const { success, created, notFound } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Drivers retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { logger.error("Get drivers failed", { error: err.message }); next(err); }
}

async function getById(req, res, next) {
    try {
        const driver = await service.getById(parseInt(req.params.id));
        return success(res, driver);
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function create(req, res, next) {
    try {
        const driver = await service.create(req.body);
        return created(res, driver, "Driver created");
    } catch (err) { logger.error("Create driver failed", { error: err.message }); next(err); }
}

async function update(req, res, next) {
    try {
        const driver = await service.update(parseInt(req.params.id), req.body);
        return success(res, driver, "Driver updated");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function updateLocation(req, res, next) {
    try {
        const { latitude, longitude } = req.body;
        await service.updateLocation(parseInt(req.params.id), latitude, longitude);
        return success(res, null, "Location updated");
    } catch (err) { logger.error("Update location failed", { error: err.message }); next(err); }
}

async function getMe(req, res, next) {
    try {
        const driver = await service.getMe(req.user.userId);
        if (!driver) return notFound(res, "Driver profile not found");
        return success(res, driver);
    } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, updateLocation, getMe };
