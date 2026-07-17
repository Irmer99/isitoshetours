const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/notification.controller');

router.use(authMiddleware, requireRole('admin'));

router.get('/unread-count', asyncHandler(ctrl.unreadCount));
router.get('/', asyncHandler(ctrl.list));
router.patch('/read-all', asyncHandler(ctrl.markAllRead));
router.patch('/:id/read', asyncHandler(ctrl.markRead));

module.exports = router;
