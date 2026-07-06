const { Router } = require('express');
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     tags: [Stats]
 *     summary: Dashboard overview for admin panel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsOverview'
 */
router.get('/overview', asyncHandler(statsController.overview));

/**
 * @swagger
 * /stats/bookings-by-route:
 *   get:
 *     tags: [Stats]
 *     summary: Bookings grouped by itinerary route
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings by route
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   count: { type: integer }
 *                   revenue: { type: number }
 */
router.get('/bookings-by-route', asyncHandler(statsController.bookingsByRoute));

/**
 * @swagger
 * /stats/bookings-over-time:
 *   get:
 *     tags: [Stats]
 *     summary: Bookings over time
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema: { type: integer, default: 30 }
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Bookings aggregated by day
 */
router.get('/bookings-over-time', asyncHandler(statsController.bookingsOverTime));

/**
 * @swagger
 * /stats/conversion:
 *   get:
 *     tags: [Stats]
 *     summary: Enquiry vs confirmed booking conversion rate
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversion stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsConversion'
 */
router.get('/conversion', asyncHandler(statsController.conversion));

module.exports = router;
