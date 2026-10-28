const express = require("express");
const router = express.Router();
const ctrl = require("./roles.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.put("/:id/permissions", ctrl.updatePermissions);

module.exports = router;
