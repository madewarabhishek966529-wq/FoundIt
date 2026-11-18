import { Router } from 'express';
import {
  create,
  list,
  getMine,
  getOne,
  update,
  remove,
  getMatches,
  searchImage,
  reEmbedItem
} from '../controllers/item.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadImages, uploadSingleImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { itemCreateLimiter, searchImageLimiter } from '../middleware/rateLimit.js';
import {
  createItemSchema,
  updateItemSchema,
  queryItemsSchema,
  itemIdParamSchema
} from '../validators/item.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Create new item
router.post(
  '/',
  requireAuth,
  itemCreateLimiter,
  uploadImages,
  validate(createItemSchema),
  asyncHandler(create)
);

// Search by image (transient search)
router.post(
  '/search-by-image',
  optionalAuth,
  searchImageLimiter,
  uploadSingleImage,
  asyncHandler(searchImage)
);

// List items
router.get('/', validate(queryItemsSchema), asyncHandler(list));

// Caller's items
router.get('/mine', requireAuth, asyncHandler(getMine));

// Matches for an item
router.get('/:id/matches', requireAuth, validate(itemIdParamSchema), asyncHandler(getMatches));

// Retry embedding
router.post('/:id/re-embed', requireAuth, validate(itemIdParamSchema), asyncHandler(reEmbedItem));

// Single item CRUD
router.get('/:id', optionalAuth, validate(itemIdParamSchema), asyncHandler(getOne));
router.patch('/:id', requireAuth, validate(updateItemSchema), asyncHandler(update));
router.delete('/:id', requireAuth, validate(itemIdParamSchema), asyncHandler(remove));

export default router;
