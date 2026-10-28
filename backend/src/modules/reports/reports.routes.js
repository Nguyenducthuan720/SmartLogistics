const express = require("express");
const router = express.Router();
const ctrl = require("./reports.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);
router.use(authorize("ADMIN", "WAREHOUSE_MANAGER"));

router.get("/orders", ctrl.orderReport);
router.get("/revenue", ctrl.revenueReport);
router.get("/drivers", ctrl.driverReport);

module.exports = router;
