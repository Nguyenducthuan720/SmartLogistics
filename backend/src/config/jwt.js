const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SmartLogistics2026";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    JWT_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};
