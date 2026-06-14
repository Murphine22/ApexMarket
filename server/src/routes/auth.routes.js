const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { authValidators } = require('../validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & account endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Jane Doe }
 *               email: { type: string, example: jane@apexmarket.io }
 *               password: { type: string, example: secret123 }
 *               role: { type: string, enum: [admin, staff], example: staff }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(authValidators.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@apexmarket.io }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200: { description: Authenticated }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(authValidators.login), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out (clears refresh cookie)
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authController.logout);

module.exports = router;
