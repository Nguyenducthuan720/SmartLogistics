const express = require("express");
const router = express.Router();
const ctrl = require("./notifications.controller");
const authenticate = require("../../middleware/auth.middleware");

router.use(authenticate);

router.get("/", ctrl.getUserNotifications);
router.put("/:id/read", ctrl.markAsRead);
router.put("/read-all", ctrl.markAllAsRead);

module.exports = router;
