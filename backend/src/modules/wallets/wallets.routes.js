const express = require("express");
const router = express.Router();
const ctrl = require("./wallets.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

router.use(authenticate);
router.use(authorize("DRIVER"));

router.get("/me", ctrl.getMe);
router.get("/me/transactions", ctrl.getTransactions);
router.get("/me/earnings", ctrl.getEarnings);
router.post("/me/link-bank", ctrl.linkBank);
router.post("/me/deposit", ctrl.deposit);
router.post("/me/withdraw", ctrl.withdraw);

module.exports = router;
