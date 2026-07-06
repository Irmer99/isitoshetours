const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');

const router = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 */
router.post('/', validateBody(createBookingSchema), asyncHandler(bookingController.create));

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings
 *     description: Admin can filter by status, itinerary, date range
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [enquiry, confirmed, completed, cancelled] }
 *       - in: query
 *         name: itinerary
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
router.get('/', asyncHandler(bookingController.list));

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.get('/:id', asyncHandler(bookingController.detail));

/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingStatusUpdate'
 *     responses:
 *       200:
 *         description: Booking status updated
 *       400:
 *         description: Invalid transition
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', authMiddleware, validateBody(updateBookingStatusSchema), asyncHandler(bookingController.updateStatus));

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete/cancel a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', authMiddleware, asyncHandler(bookingController.remove));

/**
 * @swagger
 * /bookings/{id}/history:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking status change history
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status change log
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from: { type: string }
 *                   to: { type: string }
 *                   changedBy: { type: object }
 *                   changedAt: { type: string, format: date-time }
 */
router.get('/:id/history', asyncHandler(bookingController.history));

module.exports = router;
