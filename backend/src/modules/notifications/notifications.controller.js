const service = require("./notifications.service");
const { success, created } = require("../../utils/response");

async function getUserNotifications(req, res, next) {
    try {
        const result = await service.getByUser(req.user.userId, req.query);
        return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (err) { next(err); }
}

async function markAsRead(req, res, next) {
    try { await service.markAsRead(parseInt(req.params.id)); return success(res, null, "Marked as read"); } catch (err) { next(err); }
}

async function markAllAsRead(req, res, next) {
    try { await service.markAllAsRead(req.user.userId); return success(res, null, "All marked as read"); } catch (err) { next(err); }
}

module.exports = { getUserNotifications, markAsRead, markAllAsRead };
