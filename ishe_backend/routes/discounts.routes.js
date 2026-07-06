const { Router } = require('express');
const discountController = require('../controllers/discount.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const asyncHandler = require('../middleware/asyncHandler');
const { createDiscountSchema, updateDiscountSchema, validateDiscountSchema } = require('../validators/discount.validator');

const router = Router();

router.get('/', authMiddleware, asyncHandler(discountController.list));
router.post('/', authMiddleware, validateBody(createDiscountSchema), asyncHandler(discountController.create));
router.patch('/:id', authMiddleware, validateBody(updateDiscountSchema), asyncHandler(discountController.update));
router.delete('/:id', authMiddleware, asyncHandler(discountController.remove));
router.post('/validate', validateBody(validateDiscountSchema), asyncHandler(discountController.validate));

module.exports = router;
