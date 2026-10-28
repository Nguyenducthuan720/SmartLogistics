const trackingModel = require("./tracking.model");

async function getByShipment(shipmentId) {
    return trackingModel.findByShipment(shipmentId);
}

async function create(data) {
    return trackingModel.create(data);
}

module.exports = { getByShipment, create };
