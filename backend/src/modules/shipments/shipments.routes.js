const express = require("express");
const router = express.Router();
const ctrl = require("./shipments.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/available", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.getAvailable);
router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.getById);
router.post("/", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.create);
router.put("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.update);
router.post("/:id/accept", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.acceptShipment);
router.put("/:id/assign-driver", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.assignDriver);
router.put("/:id/assign-vehicle", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.assignVehicle);
router.put("/:id/status", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.updateStatus);

module.exports = router;
