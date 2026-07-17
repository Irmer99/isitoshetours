const { Router } = require('express');
const discountController = require('../controllers/discount.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { publicPostLimiter } = require('../middleware/rateLimit');
const { createDiscountSchema, updateDiscountSchema, validateDiscountSchema } = require('../validators/discount.validator');

const router = Router();

/**
 * @swagger
 * /discounts:
 *   get:
 *     tags: [Discounts]
 *     summary: List all discounts (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 */
router.get('/', authMiddleware, asyncHandler(discountController.list));

/**
 * @swagger
 * /discounts:
 *   post:
 *     tags: [Discounts]
 *     summary: Create a discount (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountInput'
 *     responses:
 *       201:
 *         description: Discount created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discount'
 */
router.post('/', authMiddleware, requireRole('superadmin'), validateBody(createDiscountSchema), asyncHandler(discountController.create));

/**
 * @swagger
 * /discounts/{id}:
 *   patch:
 *     tags: [Discounts]
 *     summary: Update a discount (admin only)
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
 *             $ref: '#/components/schemas/DiscountInput'
 *     responses:
 *       200:
 *         description: Discount updated
 *       404:
 *         description: Discount not found
 */
router.patch('/:id', authMiddleware, requireRole('superadmin'), validateBody(updateDiscountSchema), asyncHandler(discountController.update));

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     tags: [Discounts]
 *     summary: Delete a discount (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Discount deleted
 *       404:
 *         description: Discount not found
 */
router.delete('/:id', authMiddleware, requireRole('superadmin'), asyncHandler(discountController.remove));

/**
 * @swagger
 * /discounts/validate:
 *   post:
 *     tags: [Discounts]
 *     summary: Validate a discount code (public)
 *     description: Called by the booking form before submit
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountValidateInput'
 *     responses:
 *       200:
 *         description: Discount validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountValidateResponse'
 *       404:
 *         description: Invalid or expired code
 */
router.post('/validate', publicPostLimiter, validateBody(validateDiscountSchema), asyncHandler(discountController.validate));

module.exports = router;
