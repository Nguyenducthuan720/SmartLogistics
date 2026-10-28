const express = require("express");
const router = express.Router();
const ctrl = require("./customers.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/me", ctrl.getMe);
router.post("/become-driver", ctrl.becomeDriver);
router.get("/", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getAll);
router.get("/:id", authorize("ADMIN", "WAREHOUSE_MANAGER"), ctrl.getById);
router.post("/", authorize("ADMIN"), ctrl.create);
router.put("/:id", authorize("ADMIN"), ctrl.update);

module.exports = router;
