const { forbidden } = require("../utils/response");

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return forbidden(res, "Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            return forbidden(res, "You do not have permission to perform this action");
        }

        next();
    };
}

module.exports = authorize;
