const express = require("express");
const router = express.Router();
const ctrl = require("./dashboard.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/stats", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getStats);
router.get("/warehouses", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getWarehouseSummary);

module.exports = router;
