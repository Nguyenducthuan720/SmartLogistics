const authModel = require("./auth.model");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../../config/jwt");
const { v4: uuidv4 } = require("uuid");

async function register({ fullName, username, email, password, phone }) {
    const existingEmail = await authModel.findUserByEmail(email);
    if (existingEmail) {
        throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    const existingUsername = await authModel.findUserByUsername(username);
    if (existingUsername) {
        throw Object.assign(new Error("Username already taken"), { statusCode: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await authModel.createUser({
        fullName,
        username,
        email,
        passwordHash,
        phone
    });

    return user;
}

async function login({ login, password }) {
    const user = login.includes("@")
        ? await authModel.findUserByEmail(login)
        : await authModel.findUserByUsername(login);

    if (!user) {
        throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    if (user.IsLocked) {
        throw Object.assign(new Error("Account is locked. Contact administrator"), { statusCode: 403 });
    }

    const isMatch = await comparePassword(password, user.PasswordHash);
    if (!isMatch) {
        throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    await authModel.updateLastLogin(user.UserID);

    const tokenPayload = {
        userId: user.UserID,
        email: user.Email,
        role: user.Role,
        username: user.Username
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenValue = generateRefreshToken({ userId: user.UserID, jti: uuidv4() });

    const decoded = verifyToken(refreshTokenValue);
    const expiredAt = new Date(decoded.exp * 1000);
    await authModel.saveRefreshToken(user.UserID, refreshTokenValue, expiredAt);

    return {
        user: {
            userId: user.UserID,
            fullName: user.FullName,
            username: user.Username,
            email: user.Email,
            phone: user.Phone,
            role: user.Role,
            avatar: user.Avatar
        },
        accessToken,
        refreshToken: refreshTokenValue
    };
}

async function refreshAccessToken(refreshTokenValue) {
    const storedToken = await authModel.findRefreshToken(refreshTokenValue);
    if (!storedToken) {
        throw Object.assign(new Error("Invalid or expired refresh token"), { statusCode: 401 });
    }

    let decoded;
    try {
        decoded = verifyToken(refreshTokenValue);
    } catch {
        await authModel.revokeRefreshToken(refreshTokenValue);
        throw Object.assign(new Error("Invalid or expired refresh token"), { statusCode: 401 });
    }

    const user = await authModel.findUserById(decoded.userId);
    if (!user) {
        await authModel.revokeRefreshToken(refreshTokenValue);
        throw Object.assign(new Error("User not found"), { statusCode: 401 });
    }

    const tokenPayload = {
        userId: user.UserID,
        email: user.Email,
        role: user.Role,
        username: user.Username
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return {
        accessToken: newAccessToken
    };
}

async function logout(refreshTokenValue) {
    await authModel.revokeRefreshToken(refreshTokenValue);
}

async function logoutAll(userId) {
    await authModel.revokeAllUserTokens(userId);
}

module.exports = { register, login, refreshAccessToken, logout, logoutAll };
