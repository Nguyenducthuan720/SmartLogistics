const service = require("./warehouses.service");
const { success, created, notFound } = require("../../utils/response");

async function getAll(req, res, next) {
    try { return success(res, await service.getAll()); } catch (err) { next(err); }
}
async function getById(req, res, next) {
    try { return success(res, await service.getById(parseInt(req.params.id))); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}
async function create(req, res, next) {
    try { return created(res, await service.create(req.body), "Warehouse created"); } catch (err) { next(err); }
}
async function update(req, res, next) {
    try { return success(res, await service.update(parseInt(req.params.id), req.body), "Warehouse updated"); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

module.exports = { getAll, getById, create, update };
