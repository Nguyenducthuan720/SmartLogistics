const express = require("express");
const router = express.Router();
const ctrl = require("./reviews.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.post("/", authorize("CUSTOMER"), ctrl.create);
router.get("/shipment/:shipmentId", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.getByShipment);
router.get("/driver/:driverId", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.getByDriver);
router.get("/me", authorize("CUSTOMER"), ctrl.getByCustomer);
router.get("/driver/:driverId/rating", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER", "CUSTOMER"), ctrl.getDriverRating);

module.exports = router;
