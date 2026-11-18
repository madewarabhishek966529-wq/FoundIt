import { Router } from 'express';
import { list, markRead, markAllRead } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(list));
router.patch('/read-all', asyncHandler(markAllRead));
router.patch('/:id/read', asyncHandler(markRead));

export default router;
