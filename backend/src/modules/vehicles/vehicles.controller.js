const service = require("./vehicles.service");
const { success, created, notFound } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Vehicles retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const vehicle = await service.getById(parseInt(req.params.id));
        return success(res, vehicle);
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function create(req, res, next) {
    try { const vehicle = await service.create(req.body); return created(res, vehicle, "Vehicle created"); } catch (err) { next(err); }
}

async function update(req, res, next) {
    try { const vehicle = await service.update(parseInt(req.params.id), req.body); return success(res, vehicle, "Vehicle updated"); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

module.exports = { getAll, getById, create, update };
