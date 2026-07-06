const { Router } = require('express');
const contentController = require('../controllers/content.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const {
  updateItinerarySchema,
  updateDestinationSchema,
  updateTestimonialSchema,
  updateTeamSchema,
  updateSiteSettingsSchema,
} = require('../validators/content.validator');

const router = Router();

router.get('/itineraries', asyncHandler(contentController.getItineraries));
router.get('/itineraries/:slug', asyncHandler(contentController.getItinerary));
router.patch('/itineraries/:slug', authMiddleware, validateBody(updateItinerarySchema), asyncHandler(contentController.updateItinerary));

router.get('/destinations', asyncHandler(contentController.getDestinations));
router.patch('/destinations/:id', authMiddleware, validateBody(updateDestinationSchema), asyncHandler(contentController.updateDestination));

router.get('/testimonials', asyncHandler(contentController.getTestimonials));
router.patch('/testimonials/:id', authMiddleware, validateBody(updateTestimonialSchema), asyncHandler(contentController.updateTestimonial));

router.get('/team', asyncHandler(contentController.getTeam));
router.patch('/team/:id', authMiddleware, validateBody(updateTeamSchema), asyncHandler(contentController.updateTeamMember));

router.get('/site-settings', asyncHandler(contentController.getSiteSettings));
router.patch('/site-settings', authMiddleware, validateBody(updateSiteSettingsSchema), asyncHandler(contentController.updateSiteSettings));

module.exports = router;
