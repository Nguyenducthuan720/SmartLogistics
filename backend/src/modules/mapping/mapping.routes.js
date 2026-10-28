const express = require("express");
const router = express.Router();
const ctrl = require("./mapping.controller");
const authenticate = require("../../middleware/auth.middleware");

router.use(authenticate);

router.get("/geocode", ctrl.geocode);
router.get("/reverse", ctrl.reverseGeocode);
router.get("/route", ctrl.getRoute);

module.exports = router;
