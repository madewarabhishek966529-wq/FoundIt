import { Router } from 'express';
import {
  create,
  list,
  getMine,
  getOne,
  update,
  remove
} from '../controllers/item.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { itemCreateLimiter } from '../middleware/rateLimit.js';
import {
  createItemSchema,
  updateItemSchema,
  queryItemsSchema,
  itemIdParamSchema
} from '../validators/item.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  itemCreateLimiter,
  uploadImages,
  validate(createItemSchema),
  asyncHandler(create)
);

router.get('/', validate(queryItemsSchema), asyncHandler(list));
router.get('/mine', requireAuth, asyncHandler(getMine));
router.get('/:id', optionalAuth, validate(itemIdParamSchema), asyncHandler(getOne));
router.patch('/:id', requireAuth, validate(updateItemSchema), asyncHandler(update));
router.delete('/:id', requireAuth, validate(itemIdParamSchema), asyncHandler(remove));

export default router;
