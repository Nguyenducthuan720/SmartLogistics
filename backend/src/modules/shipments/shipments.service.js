const shipmentsModel = require("./shipments.model");
const walletService = require("../wallets/wallets.service");
const logger = require("../../utils/logger");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    const { data, total } = await shipmentsModel.findAll({
        offset, limit,
        status: query.status || null,
        driverId: query.driverId ? parseInt(query.driverId) : null,
        warehouseId: query.warehouseId ? parseInt(query.warehouseId) : null
    });

    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
}

async function getById(id) {
    const shipment = await shipmentsModel.findById(id);
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });
    return shipment;
}

async function create(data) {
    return shipmentsModel.create(data);
}

async function update(id, data) {
    const shipment = await shipmentsModel.update(id, data);
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });
    return shipment;
}

async function assignDriver(id, driverId) {
    return shipmentsModel.update(id, { driverId });
}

async function assignVehicle(id, vehicleId) {
    return shipmentsModel.update(id, { vehicleId });
}

async function updateStatus(id, status) {
    const shipment = await shipmentsModel.update(id, { status });
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

    if (status === "DELIVERED" && shipment.DriverID) {
        try {
            const earned = await walletService.creditEarning(shipment.ShipmentID, shipment.DriverID);
            if (earned > 0) logger.info("Driver earning credited", { shipmentId: shipment.ShipmentID, driverId: shipment.DriverID, earned });
        } catch (err) {
            logger.warn("Failed to credit driver earning", { shipmentId: shipment.ShipmentID, error: err.message });
        }
    }

    return shipment;
}

async function getAvailable() {
    return shipmentsModel.findAvailable();
}

async function acceptShipment(shipmentId, driverId) {
    const result = await shipmentsModel.acceptShipment(shipmentId, driverId);
    if (!result) throw Object.assign(new Error("Shipment already taken or not available"), { statusCode: 409 });
    return result;
}

module.exports = { getAll, getById, create, update, assignDriver, assignVehicle, updateStatus, getAvailable, acceptShipment };
