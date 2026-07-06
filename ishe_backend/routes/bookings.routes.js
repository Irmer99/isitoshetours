const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');

const router = Router();

router.post('/', validateBody(createBookingSchema), asyncHandler(bookingController.create));
router.get('/', asyncHandler(bookingController.list));
router.get('/:id', asyncHandler(bookingController.detail));
router.patch('/:id', authMiddleware, validateBody(updateBookingStatusSchema), asyncHandler(bookingController.updateStatus));
router.delete('/:id', authMiddleware, asyncHandler(bookingController.remove));
router.get('/:id/history', asyncHandler(bookingController.history));

module.exports = router;
