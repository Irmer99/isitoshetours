const { Router } = require('express');
const clientController = require('../controllers/client.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { createClientSchema, updateClientSchema } = require('../validators/client.validator');

const router = Router();

router.post('/', validateBody(createClientSchema), asyncHandler(clientController.create));
router.get('/', authMiddleware, asyncHandler(clientController.list));
router.get('/:id', authMiddleware, asyncHandler(clientController.detail));
router.patch('/:id', authMiddleware, validateBody(updateClientSchema), asyncHandler(clientController.update));
router.get('/:id/bookings', authMiddleware, asyncHandler(clientController.bookings));

module.exports = router;
