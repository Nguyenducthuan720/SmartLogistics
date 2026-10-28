const express = require("express");
const router = express.Router();
const ctrl = require("./inventory.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getAll);
router.put("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.update);

module.exports = router;
