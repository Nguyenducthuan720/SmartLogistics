const service = require("./products.service");
const { success, created, notFound } = require("../../utils/response");
const categoriesService = require("./categories.service");

async function getCategories(req, res, next) {
    try { return success(res, await categoriesService.getAll()); } catch (err) { next(err); }
}

async function getAll(req, res, next) {
    try {
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Products retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
}
async function getById(req, res, next) {
    try { return success(res, await service.getById(parseInt(req.params.id))); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}
async function create(req, res, next) {
    try { return created(res, await service.create(req.body), "Product created"); } catch (err) { next(err); }
}
async function update(req, res, next) {
    try { return success(res, await service.update(parseInt(req.params.id), req.body), "Product updated"); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

module.exports = { getAll, getById, create, update, getCategories };
