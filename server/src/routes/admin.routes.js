import { Router } from 'express';
import {
  stats,
  deskItems,
  claimsQueue,
  handover,
  handoverLog
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Strict admin-only barrier
router.use(requireAuth, requireRole('admin'));

router.get('/stats', asyncHandler(stats));
router.get('/desk-items', asyncHandler(deskItems));
router.get('/claims', asyncHandler(claimsQueue));
router.post('/handover', asyncHandler(handover));
router.get('/handover-log', asyncHandler(handoverLog));

export default router;
