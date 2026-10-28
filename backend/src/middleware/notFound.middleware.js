const { notFound } = require("../utils/response");

function notFoundHandler(req, res) {
    return notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
}

module.exports = notFoundHandler;
