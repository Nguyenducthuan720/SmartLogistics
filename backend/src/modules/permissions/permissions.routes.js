const express = require("express");
const router = express.Router();
const ctrl = require("./permissions.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", ctrl.getAll);

module.exports = router;
