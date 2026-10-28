const service = require("./reviews.service");
const { success, created, badRequest, notFound } = require("../../utils/response");

async function create(req, res, next) {
    try {
        const review = await service.create({
            userId: req.user.userId,
            shipmentId: parseInt(req.body.shipmentId),
            rating: req.body.rating,
            comment: req.body.comment
        });
        return created(res, review, "Review submitted");
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 400) return badRequest(res, err.message);
        if (err.statusCode === 409) return res.status(409).json({ success: false, message: err.message });
        next(err);
    }
}

async function getByShipment(req, res, next) {
    try { return success(res, await service.getByShipment(parseInt(req.params.shipmentId))); } catch (err) { next(err); }
}

async function getByDriver(req, res, next) {
    try { return success(res, await service.getByDriver(parseInt(req.params.driverId))); } catch (err) { next(err); }
}

async function getByCustomer(req, res, next) {
    try { return success(res, await service.getByCustomer(req.user.userId)); } catch (err) { next(err); }
}

async function getDriverRating(req, res, next) {
    try { return success(res, await service.getDriverRating(parseInt(req.params.driverId))); } catch (err) { next(err); }
}

module.exports = { create, getByShipment, getByDriver, getByCustomer, getDriverRating };
