function success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

function created(res, data = null, message = "Created successfully") {
    return success(res, data, message, 201);
}

function paginated(res, data, pagination) {
    return res.status(200).json({
        success: true,
        message: "Success",
        data,
        pagination
    });
}

function error(res, message = "Internal Server Error", statusCode = 500, errors = null) {
    const body = {
        success: false,
        message
    };
    if (errors) {
        body.errors = errors;
    }
    return res.status(statusCode).json(body);
}

function badRequest(res, message = "Bad Request", errors = null) {
    return error(res, message, 400, errors);
}

function unauthorized(res, message = "Unauthorized") {
    return error(res, message, 401);
}

function forbidden(res, message = "Forbidden") {
    return error(res, message, 403);
}

function notFound(res, message = "Not Found") {
    return error(res, message, 404);
}

function conflict(res, message = "Conflict") {
    return error(res, message, 409);
}

module.exports = {
    success,
    created,
    paginated,
    error,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict
};
