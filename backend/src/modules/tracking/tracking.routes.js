const express = require("express");
const router = express.Router();
const ctrl = require("./tracking.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/shipment/:shipmentId", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.getByShipment);
router.post("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.create);

module.exports = router;
