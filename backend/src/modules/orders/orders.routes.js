const express = require("express");
const router = express.Router();
const ctrl = require("./orders.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER", "DRIVER"), ctrl.getById);
router.post("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.create);
router.put("/:id/status", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.updateStatus);

module.exports = router;
