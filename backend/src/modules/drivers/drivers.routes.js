const express = require("express");
const router = express.Router();
const ctrl = require("./drivers.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/me", ctrl.getMe);
router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER", "DRIVER"), ctrl.getById);
router.post("/", authorize("ADMIN"), ctrl.create);
router.put("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.update);
router.put("/:id/location", authorize("ADMIN", "DRIVER"), ctrl.updateLocation);

module.exports = router;
