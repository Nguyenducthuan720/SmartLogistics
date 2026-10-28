const service = require("./customers.service");
const { success, created, notFound, badRequest } = require("../../utils/response");
const { generateAccessToken } = require("../../config/jwt");
const logger = require("../../utils/logger");

async function getAll(req, res, next) {
    try { const r = await service.getAll(req.query); return res.status(200).json({ success: true, message: "Customers retrieved", data: r.data, pagination: r.pagination }); } catch (err) { next(err); }
}
async function getById(req, res, next) {
    try { return success(res, await service.getById(parseInt(req.params.id))); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}
async function getMe(req, res, next) {
    try { return success(res, await service.getMe(req.user.userId)); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}
async function create(req, res, next) {
    try { return created(res, await service.create(req.body), "Customer created"); } catch (err) { next(err); }
}
async function update(req, res, next) {
    try { return success(res, await service.update(parseInt(req.params.id), req.body), "Customer updated"); } catch (err) { if (err.statusCode === 404) return notFound(res, err.message); next(err); }
}
async function becomeDriver(req, res, next) {
    try {
        const { licenseNumber, licenseType } = req.body;
        if (!licenseNumber) return badRequest(res, "License number is required");

        const driversModel = require("../drivers/drivers.model");
        const existing = await driversModel.findByUserId(req.user.userId);
        if (existing) return success(res, existing, "Already a driver");

        const driver = await driversModel.create({ userId: req.user.userId, licenseNumber, licenseType });

        const pool = require("../../config/database");
        await pool.request()
            .input("UserID", req.user.userId)
            .input("RoleID", 3)
            .query("UPDATE Users SET RoleID = @RoleID, UpdatedAt = GETDATE() WHERE UserID = @UserID");

        const newToken = generateAccessToken({
            userId: req.user.userId,
            email: req.user.email,
            role: "DRIVER",
            username: req.user.username
        });

        return created(res, {
            driver,
            accessToken: newToken,
            role: "DRIVER"
        }, "Driver profile created! You are now a driver");
    } catch (err) { next(err); }
}

module.exports = { getAll, getById, getMe, create, update, becomeDriver };
