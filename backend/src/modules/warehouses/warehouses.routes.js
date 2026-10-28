const express = require("express");
const router = express.Router();
const ctrl = require("./warehouses.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getById);
router.post("/", authorize("ADMIN"), ctrl.create);
router.put("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.update);

module.exports = router;
