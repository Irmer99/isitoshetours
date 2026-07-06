const { Router } = require('express');
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = Router();

router.use(authMiddleware);

router.get('/overview', asyncHandler(statsController.overview));
router.get('/bookings-by-route', asyncHandler(statsController.bookingsByRoute));
router.get('/bookings-over-time', asyncHandler(statsController.bookingsOverTime));
router.get('/conversion', asyncHandler(statsController.conversion));

module.exports = router;
