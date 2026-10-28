const service = require("./tracking.service");
const { success, created } = require("../../utils/response");
const { getIO } = require("../../config/socket");
const logger = require("../../utils/logger");

async function getByShipment(req, res, next) {
    try {
        const history = await service.getByShipment(parseInt(req.params.shipmentId));
        return success(res, history);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const entry = await service.create(req.body);
        const io = getIO();
        io.to(`shipment:${entry.ShipmentID}`).emit("tracking:new", entry);
        return created(res, entry, "Tracking entry created");
    } catch (err) { next(err); }
}

module.exports = { getByShipment, create };
