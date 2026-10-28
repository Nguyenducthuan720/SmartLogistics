const { verifyToken } = require("../config/jwt");
const { unauthorized } = require("../utils/response");

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return unauthorized(res, "Access token is required");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return unauthorized(res, "Access token has expired");
        }
        return unauthorized(res, "Invalid access token");
    }
}

module.exports = authenticate;
