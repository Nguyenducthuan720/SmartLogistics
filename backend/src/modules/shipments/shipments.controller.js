const service = require("./shipments.service");
const { success, created, notFound } = require("../../utils/response");
const { getIO } = require("../../config/socket");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try {
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Shipments retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { logger.error("Get shipments failed", { error: err.message }); next(err); }
}

async function getById(req, res, next) {
    try {
        const shipment = await service.getById(parseInt(req.params.id));
        return success(res, shipment);
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function create(req, res, next) {
    try {
        const shipment = await service.create(req.body);
        return created(res, shipment, "Shipment created");
    } catch (err) { logger.error("Create shipment failed", { error: err.message }); next(err); }
}

async function update(req, res, next) {
    try {
        const shipment = await service.update(parseInt(req.params.id), req.body);
        const io = getIO();
        io.to(`shipment:${shipment.ShipmentID}`).emit("shipment:updated", shipment);
        return success(res, shipment, "Shipment updated");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function assignDriver(req, res, next) {
    try {
        const shipment = await service.assignDriver(parseInt(req.params.id), req.body.driverId);
        return success(res, shipment, "Driver assigned");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function assignVehicle(req, res, next) {
    try {
        const shipment = await service.assignVehicle(parseInt(req.params.id), req.body.vehicleId);
        return success(res, shipment, "Vehicle assigned");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function updateStatus(req, res, next) {
    try {
        const shipment = await service.updateStatus(parseInt(req.params.id), req.body.status);
        const io = getIO();
        io.to(`shipment:${shipment.ShipmentID}`).emit("shipment:status", shipment);
        return success(res, shipment, "Status updated");
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function getAvailable(req, res, next) {
    try {
        const shipments = await service.getAvailable();
        return success(res, shipments);
    } catch (err) { next(err); }
}

async function acceptShipment(req, res, next) {
    try {
        const shipment = await service.acceptShipment(parseInt(req.params.id), req.body.driverId);
        const io = getIO();
        io.emit("shipment:accepted", shipment);
        return success(res, shipment, "Shipment accepted");
    } catch (err) { if (err.statusCode === 409) return res.status(409).json({ success: false, message: err.message }); next(err); }
}

module.exports = { getAll, getById, create, update, assignDriver, assignVehicle, updateStatus, getAvailable, acceptShipment };
