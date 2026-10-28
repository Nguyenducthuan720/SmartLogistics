const ordersModel = require("./orders.model");
const shipmentsModel = require("../shipments/shipments.model");
const logger = require("../../utils/logger");

async function getAll(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    const { data, total } = await ordersModel.findAll({
        offset,
        limit,
        status: query.status || null,
        customerId: query.customerId ? parseInt(query.customerId) : null,
        search: query.search || null
    });

    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
}

async function getById(id) {
    const order = await ordersModel.findById(id);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    return order;
}

async function create(data) {
    const order = await ordersModel.create(data);

    try {
        order.shipment = await shipmentsModel.create({ orderId: order.OrderID });
    } catch (err) {
        logger.warn("Auto-create shipment failed", { orderId: order.OrderID, error: err.message });
    }

    return order;
}

async function updateStatus(id, status) {
    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        throw Object.assign(new Error("Invalid status"), { statusCode: 400 });
    }
    const order = await ordersModel.updateStatus(id, status);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    return order;
}

module.exports = { getAll, getById, create, updateStatus };
