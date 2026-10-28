const logger = require("../utils/logger");
const { error: errorResponse } = require("../utils/response");

function errorHandler(err, req, res, _next) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });

    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return errorResponse(res, "File size exceeds 5MB limit", 413);
        }
        return errorResponse(res, err.message, 400);
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return errorResponse(res, "Invalid or expired token", 401);
    }

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message;

    return errorResponse(res, message, statusCode);
}

module.exports = errorHandler;
