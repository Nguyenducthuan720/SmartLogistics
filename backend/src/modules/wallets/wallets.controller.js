const service = require("./wallets.service");
const { success, badRequest } = require("../../utils/response");
const logger = require("../../utils/logger");

async function getMe(req, res, next) {
    try {
        const data = await service.getMe(req.user.userId);
        return success(res, data, "Wallet loaded");
    } catch (err) { if (err.statusCode === 404) return badRequest(res, err.message); next(err); }
}

async function getTransactions(req, res, next) {
    try {
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
        const data = await service.getTransactions(req.user.userId, limit);
        return success(res, data, "Transactions loaded");
    } catch (err) { next(err); }
}

async function getEarnings(req, res, next) {
    try {
        const data = await service.getEarnings(req.user.userId);
        return success(res, data, "Earnings loaded");
    } catch (err) { next(err); }
}

async function linkBank(req, res, next) {
    try {
        const { bankName, bankAccountNumber, accountHolder } = req.body;
        if (!bankName || !bankAccountNumber) {
            return badRequest(res, "Bank name and account number are required");
        }
        const wallet = await service.linkBank(req.user.userId, { bankName, bankAccountNumber, accountHolder });
        return success(res, wallet, "Bank account linked");
    } catch (err) { if (err.statusCode === 404) return badRequest(res, err.message); next(err); }
}

async function deposit(req, res, next) {
    try {
        const result = await service.deposit(req.user.userId, req.body.amount);
        return success(res, result, "Deposit successful");
    } catch (err) { if (err.statusCode === 400) return badRequest(res, err.message); next(err); }
}

async function withdraw(req, res, next) {
    try {
        const result = await service.withdraw(req.user.userId, req.body.amount);
        return success(res, result, "Withdrawal successful");
    } catch (err) { if (err.statusCode === 400) return badRequest(res, err.message); next(err); }
}

module.exports = { getMe, getTransactions, getEarnings, linkBank, deposit, withdraw };
