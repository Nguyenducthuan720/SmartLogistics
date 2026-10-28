const { body } = require("express-validator");

const updateRules = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage("Full name must be at most 150 characters"),
    body("phone")
        .optional({ values: "falsy" })
        .isMobilePhone("any").withMessage("Invalid phone number"),
    body("gender")
        .optional()
        .isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be MALE, FEMALE or OTHER"),
    body("roleId")
        .optional()
        .isInt({ min: 1 }).withMessage("Invalid role ID"),
    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be boolean"),
    body("isLocked")
        .optional()
        .isBoolean().withMessage("isLocked must be boolean")
];

module.exports = { updateRules };
