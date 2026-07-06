const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validateBody = require('../middleware/validateBody');
const { loginSchema, refreshSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/seed', authController.seed);

module.exports = router;
