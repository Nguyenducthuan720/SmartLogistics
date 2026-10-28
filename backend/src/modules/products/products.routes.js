const express = require("express");
const router = express.Router();
const ctrl = require("./products.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/categories", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.getCategories);
router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.getById);
router.post("/", authorize("ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER"), ctrl.create);
router.put("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.update);

module.exports = router;
