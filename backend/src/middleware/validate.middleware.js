const { validationResult } = require("express-validator");
const { badRequest } = require("../utils/response");

function validate(rules) {
    return [
        ...rules,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const formattedErrors = errors.array().map((e) => ({
                    field: e.path,
                    message: e.msg
                }));
                return badRequest(res, "Validation failed", formattedErrors);
            }
            next();
        }
    ];
}

module.exports = validate;
