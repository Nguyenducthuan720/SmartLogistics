const service = require("./inventory.service");
const { success, notFound } = require("../../utils/response");

async function getAll(req, res, next) {
    try {
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Inventory retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const inv = await service.update(parseInt(req.params.id), req.body);
        return success(res, inv, "Inventory updated");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

module.exports = { getAll, update };
