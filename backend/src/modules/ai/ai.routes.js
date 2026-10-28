const express = require("express");
const router = express.Router();
const ctrl = require("./ai.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.post("/optimize-route", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.optimizeRoute);
router.post("/delivery-time", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.predictDeliveryTime);
router.get("/predict-eta/:shipmentId", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.predictETA);
router.get("/shipment-route/:shipmentId", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.shipmentRoute);
router.get("/predictions/:shipmentId", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getPredictionHistory);

module.exports = router;
