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

/**
 * @swagger
 * /content/itineraries:
 *   get:
 *     tags: [Content]
 *     summary: List all itineraries
 *     responses:
 *       200:
 *         description: List of itineraries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Itinerary'
 */
router.get('/itineraries', asyncHandler(contentController.getItineraries));

/**
 * @swagger
 * /content/itineraries/{slug}:
 *   get:
 *     tags: [Content]
 *     summary: Get itinerary by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Itinerary detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 */
router.get('/itineraries/:slug', asyncHandler(contentController.getItinerary));

/**
 * @swagger
 * /content/itineraries/{slug}:
 *   patch:
 *     tags: [Content]
 *     summary: Update an itinerary (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Itinerary'
 *     responses:
 *       200:
 *         description: Itinerary updated
 */
router.patch('/itineraries/:slug', authMiddleware, validateBody(updateItinerarySchema), asyncHandler(contentController.updateItinerary));

/**
 * @swagger
 * /content/destinations:
 *   get:
 *     tags: [Content]
 *     summary: List all destinations
 *     responses:
 *       200:
 *         description: List of destinations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destination'
 */
router.get('/destinations', asyncHandler(contentController.getDestinations));

/**
 * @swagger
 * /content/destinations/{id}:
 *   patch:
 *     tags: [Content]
 *     summary: Update a destination (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Destination updated
 */
router.patch('/destinations/:id', authMiddleware, validateBody(updateDestinationSchema), asyncHandler(contentController.updateDestination));

/**
 * @swagger
 * /content/testimonials:
 *   get:
 *     tags: [Content]
 *     summary: List active testimonials
 *     responses:
 *       200:
 *         description: List of testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Testimonial'
 */
router.get('/testimonials', asyncHandler(contentController.getTestimonials));

/**
 * @swagger
 * /content/testimonials/{id}:
 *   patch:
 *     tags: [Content]
 *     summary: Update a testimonial (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Testimonial updated
 */
router.patch('/testimonials/:id', authMiddleware, validateBody(updateTestimonialSchema), asyncHandler(contentController.updateTestimonial));

/**
 * @swagger
 * /content/team:
 *   get:
 *     tags: [Content]
 *     summary: List active team members
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */
router.get('/team', asyncHandler(contentController.getTeam));

/**
 * @swagger
 * /content/team/{id}:
 *   patch:
 *     tags: [Content]
 *     summary: Update a team member (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Team member updated
 */
router.patch('/team/:id', authMiddleware, validateBody(updateTeamSchema), asyncHandler(contentController.updateTeamMember));

/**
 * @swagger
 * /content/site-settings:
 *   get:
 *     tags: [Content]
 *     summary: Get site settings
 *     responses:
 *       200:
 *         description: Site settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SiteSettings'
 */
router.get('/site-settings', asyncHandler(contentController.getSiteSettings));

/**
 * @swagger
 * /content/site-settings:
 *   patch:
 *     tags: [Content]
 *     summary: Update site settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Site settings updated
 */
router.patch('/site-settings', authMiddleware, validateBody(updateSiteSettingsSchema), asyncHandler(contentController.updateSiteSettings));

module.exports = router;
