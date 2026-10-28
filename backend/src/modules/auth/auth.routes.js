const express = require("express");
const router = express.Router();
const ctrl = require("./auth.controller");
const { registerRules, loginRules, refreshRules } = require("./auth.validation");
const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, username, email, password]
 *             properties:
 *               fullName: { type: string }
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email/username already exists }
 */
router.post("/register", validate(registerRules), ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to get access & refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [login, password]
 *             properties:
 *               login: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful with tokens }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validate(loginRules), ctrl.login);

router.post("/refresh-token", validate(refreshRules), ctrl.refreshToken);
router.post("/logout", authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get("/profile", authenticate, ctrl.getProfile);

module.exports = router;
