const reviewsModel = require("./reviews.model");
const customersModel = require("../customers/customers.model");
const shipmentsModel = require("../shipments/shipments.model");

async function create({ userId, shipmentId, rating, comment }) {
    const ratingInt = parseInt(rating);
    if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
        throw Object.assign(new Error("Rating must be between 1 and 5"), { statusCode: 400 });
    }

    const customer = await customersModel.findByUserId(userId);
    if (!customer) throw Object.assign(new Error("Customer profile not found"), { statusCode: 404 });

    const shipment = await shipmentsModel.findById(shipmentId);
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });
    if (!shipment.DriverID) throw Object.assign(new Error("Shipment has no assigned driver"), { statusCode: 400 });

    const existing = await reviewsModel.getByShipment(shipmentId);
    if (existing) throw Object.assign(new Error("This shipment has already been reviewed"), { statusCode: 409 });

    return reviewsModel.create({
        shipmentId,
        customerId: customer.CustomerID,
        driverId: shipment.DriverID,
        rating: ratingInt,
        comment
    });
}

async function getByShipment(shipmentId) {
    return reviewsModel.getByShipment(shipmentId);
}

async function getByDriver(driverId) {
    return reviewsModel.getByDriver(driverId);
}

async function getByCustomer(userId) {
    const customer = await customersModel.findByUserId(userId);
    if (!customer) return [];
    return reviewsModel.getByCustomer(customer.CustomerID);
}

async function getDriverRating(driverId) {
    return reviewsModel.getDriverRating(driverId);
}

module.exports = { create, getByShipment, getByDriver, getByCustomer, getDriverRating };
