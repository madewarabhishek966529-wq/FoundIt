import { Router } from 'express';
import {
  create,
  getMine,
  getIncoming,
  approve,
  reject,
  cancel
} from '../controllers/claim.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createClaimSchema,
  rejectClaimSchema,
  claimIdParamSchema
} from '../validators/claim.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createClaimSchema), asyncHandler(create));
router.get('/mine', asyncHandler(getMine));
router.get('/incoming', asyncHandler(getIncoming));
router.patch('/:id/approve', validate(claimIdParamSchema), asyncHandler(approve));
router.patch('/:id/reject', validate(claimIdParamSchema), validate(rejectClaimSchema), asyncHandler(reject));
router.patch('/:id/cancel', validate(claimIdParamSchema), asyncHandler(cancel));

export default router;
