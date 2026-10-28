const service = require("./orders.service");
const { success, created, notFound, badRequest, paginated } = require("../../utils/response");
const logger = require("../../utils/logger");
const customersModel = require("../customers/customers.model");

async function getAll(req, res, next) {
    try {
        if (req.user.role === "CUSTOMER") {
            const customer = await customersModel.findByUserId(req.user.userId);
            req.query.customerId = customer?.CustomerID || 0;
        }
        const result = await service.getAll(req.query);
        return res.status(200).json({ success: true, message: "Orders retrieved", data: result.data, pagination: result.pagination });
    } catch (err) { logger.error("Get orders failed", { error: err.message }); next(err); }
}

async function getById(req, res, next) {
    try {
        const order = await service.getById(parseInt(req.params.id));
        return success(res, order);
    } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}

async function create(req, res, next) {
    try {
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return badRequest(res, "Order must contain at least one product item");
        }

        const customer = await customersModel.ensureCustomerProfile(req.user.userId);
        const orderData = { ...req.body, customerId: req.body.customerId || customer.CustomerID };
        const order = await service.create(orderData);
        return created(res, order, "Order created");
    } catch (err) { logger.error("Create order failed", { error: err.message }); next(err); }
}

async function updateStatus(req, res, next) {
    try {
        const order = await service.updateStatus(parseInt(req.params.id), req.body.status);
        return success(res, order, "Order status updated");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 400) return badRequest(res, err.message);
        next(err);
    }
}

module.exports = { getAll, getById, create, updateStatus };
