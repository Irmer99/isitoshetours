const { Router } = require('express');
const clientController = require('../controllers/client.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { publicPostLimiter } = require('../middleware/rateLimit');
const { createClientSchema, updateClientSchema } = require('../validators/client.validator');

const router = Router();

/**
 * @swagger
 * /clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create a client
 *     description: Clients can be created directly or auto-created on first booking
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       201:
 *         description: Client created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error
 */
router.post('/', publicPostLimiter, validateBody(createClientSchema), asyncHandler(clientController.create));

/**
 * @swagger
 * /clients:
 *   get:
 *     tags: [Clients]
 *     summary: List clients (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 */
router.get('/', authMiddleware, asyncHandler(clientController.list));

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Get client detail (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client detail
 *       404:
 *         description: Client not found
 */
router.get('/:id', authMiddleware, asyncHandler(clientController.detail));

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     tags: [Clients]
 *     summary: Update client info (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       200:
 *         description: Client updated
 *       404:
 *         description: Client not found
 */
router.patch('/:id', authMiddleware, validateBody(updateClientSchema), asyncHandler(clientController.update));

/**
 * @swagger
 * /clients/{id}/bookings:
 *   get:
 *     tags: [Clients]
 *     summary: Get booking history for a client (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client's booking history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
router.get('/:id/bookings', authMiddleware, asyncHandler(clientController.bookings));

module.exports = router;
