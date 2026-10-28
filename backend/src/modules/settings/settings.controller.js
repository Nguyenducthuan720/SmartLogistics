const service = require("./settings.service");
const { success } = require("../../utils/response");

async function getAll(req, res, next) {
    try { return success(res, await service.getAll()); } catch (err) { next(err); }
}
async function update(req, res, next) {
    try {
        const { key, value, description } = req.body;
        await service.update(key, value, description);
        return success(res, null, "Setting updated");
    } catch (err) { next(err); }
}

module.exports = { getAll, update };
