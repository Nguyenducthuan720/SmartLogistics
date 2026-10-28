const express = require("express");
const router = express.Router();
const ctrl = require("./users.controller");
const { updateRules } = require("./users.validation");
const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", authorize("ADMIN"), ctrl.getAll);
router.get("/:id", authorize("ADMIN"), ctrl.getById);
router.put("/:id", authorize("ADMIN"), validate(updateRules), ctrl.update);
router.delete("/:id", authorize("ADMIN"), ctrl.remove);

module.exports = router;
