const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { publicPostLimiter } = require('../middleware/rateLimit');
const { createBookingSchema, updateBookingStatusSchema, updateBookingEditSchema } = require('../validators/booking.validator');

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
router.post('/', publicPostLimiter, validateBody(createBookingSchema), asyncHandler(bookingController.create));

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
router.get('/', authMiddleware, asyncHandler(bookingController.list));

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
router.get('/:id', authMiddleware, asyncHandler(bookingController.detail));

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
 * /bookings/{id}/edit:
 *   patch:
 *     tags: [Bookings]
 *     summary: Edit booking fields
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
 *             type: object
 *             properties:
 *               itinerary: { type: string }
 *               itineraryTitle: { type: string }
 *               travelDate: { type: string, format: date }
 *               participants: { type: integer, minimum: 1 }
 *               totalAmount: { type: number, exclusiveMinimum: 0 }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Booking updated
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/edit', authMiddleware, validateBody(updateBookingEditSchema), asyncHandler(bookingController.update));

/**
 * @swagger
 * /bookings/{id}/archive:
 *   patch:
 *     tags: [Bookings]
 *     summary: Archive a booking (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking archived
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/archive', authMiddleware, asyncHandler(bookingController.archive));

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
router.get('/:id/history', authMiddleware, asyncHandler(bookingController.history));

module.exports = router;
