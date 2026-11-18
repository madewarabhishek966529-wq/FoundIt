import { Router } from 'express';
import { dismissMatch, getMyMatches } from '../controllers/match.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.patch('/:id/dismiss', asyncHandler(dismissMatch));
router.get('/mine', asyncHandler(getMyMatches));

export default router;
