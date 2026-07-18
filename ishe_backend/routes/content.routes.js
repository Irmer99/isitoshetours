const { Router } = require('express');
const contentController = require('../controllers/content.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');
const {
  createItinerarySchema,
  updateItinerarySchema,
  createDestinationSchema,
  updateDestinationSchema,
  updateTestimonialSchema,
  updateTeamSchema,
  updateSiteSettingsSchema,
  createBlogSchema,
  updateBlogSchema,
} = require('../validators/content.validator');

const router = Router();

/**
 * @swagger
 * /content/itineraries:
 *   get:
 *     tags: [Content]
 *     summary: List all itineraries
 *     security: []
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
router.post('/itineraries', authMiddleware, validateBody(createItinerarySchema), asyncHandler(contentController.createItinerary));

router.get('/itineraries', asyncHandler(contentController.getItineraries));

/**
 * @swagger
 * /content/itineraries/{slug}:
 *   get:
 *     tags: [Content]
 *     summary: Get itinerary by slug
 *     security: []
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

router.post('/upload', authMiddleware, uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

/**
 * @swagger
 * /content/destinations:
 *   post:
 *     tags: [Content]
 *     summary: Create a destination (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DestinationInput'
 *     responses:
 *       201:
 *         description: Destination created
 */
router.post('/destinations', authMiddleware, validateBody(createDestinationSchema), asyncHandler(contentController.createDestination));

/**
 * @swagger
 * /content/destinations:
 *   get:
 *     tags: [Content]
 *     summary: List all destinations
 *     security: []
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

router.get('/destinations/:slug/itineraries', asyncHandler(contentController.getItinerariesByDestination));

router.get('/destinations/:slug', asyncHandler(contentController.getDestinationBySlug));

/**
 * @swagger
 * /content/destinations/{slug}:
 *   patch:
 *     tags: [Content]
 *     summary: Update a destination (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Destination updated
 */
router.patch('/destinations/:slug', authMiddleware, validateBody(updateDestinationSchema), asyncHandler(contentController.updateDestination));

/**
 * @swagger
 * /content/testimonials:
 *   get:
 *     tags: [Content]
 *     summary: List active testimonials
 *     security: []
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
 *     security: []
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
 *     security: []
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
router.patch('/site-settings', authMiddleware, requireRole('superadmin'), validateBody(updateSiteSettingsSchema), asyncHandler(contentController.updateSiteSettings));

router.get('/blogs', asyncHandler(contentController.getBlogs));

router.get('/blogs/:slug', asyncHandler(contentController.getBlog));

router.post('/blogs', authMiddleware, validateBody(createBlogSchema), asyncHandler(contentController.createBlog));

router.patch('/blogs/:slug', authMiddleware, validateBody(updateBlogSchema), asyncHandler(contentController.updateBlog));

router.delete('/blogs/:slug', authMiddleware, asyncHandler(contentController.deleteBlog));

module.exports = router;
