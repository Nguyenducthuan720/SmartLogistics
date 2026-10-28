const walletsModel = require("./wallets.model");
const driversModel = require("../drivers/drivers.model");

const COMMISSION_RATE = 0.12;

async function resolveDriver(userId) {
    const driver = await driversModel.findByUserId(userId);
    if (!driver) throw Object.assign(new Error("Driver profile not found"), { statusCode: 404 });
    return driver.DriverID;
}

async function getMe(userId) {
    const driverId = await resolveDriver(userId);
    const wallet = await walletsModel.ensureWallet(driverId);
    const summary = await walletsModel.getSummary(driverId);
    return { wallet, summary };
}

async function getTransactions(userId, limit = 30) {
    const driverId = await resolveDriver(userId);
    return walletsModel.getTransactions(driverId, limit);
}

async function getEarnings(userId) {
    const driverId = await resolveDriver(userId);
    return walletsModel.getEarnings(driverId);
}

async function linkBank(userId, data) {
    const driverId = await resolveDriver(userId);
    return walletsModel.linkBank(driverId, data);
}

async function deposit(userId, amount) {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
        throw Object.assign(new Error("Deposit amount must be greater than 0"), { statusCode: 400 });
    }
    const driverId = await resolveDriver(userId);
    const balance = await walletsModel.deposit(driverId, value);
    return { balance };
}

async function withdraw(userId, amount) {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
        throw Object.assign(new Error("Withdrawal amount must be greater than 0"), { statusCode: 400 });
    }
    const driverId = await resolveDriver(userId);
    const wallet = await walletsModel.getByDriver(driverId);
    if (!wallet || !wallet.IsLinked) {
        throw Object.assign(new Error("Please link a bank account before withdrawing"), { statusCode: 400 });
    }
    if ((wallet.Balance || 0) < value) {
        throw Object.assign(new Error("Insufficient wallet balance"), { statusCode: 400 });
    }
    const balance = await walletsModel.withdraw(driverId, value);
    return { balance };
}

async function creditEarning(shipmentId, driverId) {
    if (await walletsModel.hasEarning(shipmentId)) return 0;
    const orderTotal = await walletsModel.getOrderTotal(shipmentId);
    const amount = Math.round(orderTotal * COMMISSION_RATE * 100) / 100;
    if (amount <= 0) return 0;
    return walletsModel.creditEarning(shipmentId, driverId, amount);
}

module.exports = {
    getMe, getTransactions, getEarnings, linkBank, deposit, withdraw, creditEarning
};
