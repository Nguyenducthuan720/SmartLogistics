const authService = require("./auth.service");
const { success, created, badRequest, unauthorized, conflict } = require("../../utils/response");
const logger = require("../../utils/logger");

async function register(req, res, next) {
    try {
        const { fullName, username, email, password, phone } = req.body;
        const user = await authService.register({ fullName, username, email, password, phone });
        return created(res, user, "Registration successful");
    } catch (err) {
        if (err.statusCode === 409) {
            return conflict(res, err.message);
        }
        logger.error("Register failed", { error: err.message });
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { login, password } = req.body;
        const result = await authService.login({ login, password });
        return success(res, result, "Login successful");
    } catch (err) {
        if (err.statusCode === 401) {
            return unauthorized(res, err.message);
        }
        if (err.statusCode === 403) {
            return badRequest(res, err.message);
        }
        logger.error("Login failed", { error: err.message });
        next(err);
    }
}

async function refreshToken(req, res, next) {
    try {
        const { refreshToken: token } = req.body;
        const result = await authService.refreshAccessToken(token);
        return success(res, result, "Token refreshed");
    } catch (err) {
        if (err.statusCode === 401) {
            return unauthorized(res, err.message);
        }
        logger.error("Token refresh failed", { error: err.message });
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        const { refreshToken: token } = req.body;
        await authService.logout(token);
        return success(res, null, "Logged out successfully");
    } catch (err) {
        logger.error("Logout failed", { error: err.message });
        next(err);
    }
}

async function getProfile(req, res, next) {
    try {
        const { userId } = req.user;
        const { findUserById } = require("./auth.model");
        const user = await findUserById(userId);
        if (!user) {
            return unauthorized(res, "User not found");
        }
        const { PasswordHash, ...profile } = user;
        return success(res, profile);
    } catch (err) {
        logger.error("Get profile failed", { error: err.message });
        next(err);
    }
}

module.exports = { register, login, refreshToken, logout, getProfile };
