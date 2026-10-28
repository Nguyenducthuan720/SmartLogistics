const { body } = require("express-validator");

const registerRules = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ max: 150 }).withMessage("Full name must be at most 150 characters"),
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 50 }).withMessage("Username must be between 3-50 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone")
        .optional({ values: "falsy" })
        .isMobilePhone("any").withMessage("Invalid phone number")
];

const loginRules = [
    body("login")
        .trim()
        .notEmpty().withMessage("Email or username is required"),
    body("password")
        .notEmpty().withMessage("Password is required")
];

const refreshRules = [
    body("refreshToken")
        .notEmpty().withMessage("Refresh token is required")
];

module.exports = { registerRules, loginRules, refreshRules };
