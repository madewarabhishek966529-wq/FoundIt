import {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
  processItemEmbeddingAsync
} from '../services/item.service.js';
import { processAndUploadMultiple } from '../services/upload.service.js';
import { getItemMatches, searchByImage } from '../services/matching.service.js';
import { ApiError } from '../utils/ApiError.js';
import { Item } from '../models/Item.js';

export const create = async (req, res) => {
  // Process uploaded images via sharp / Cloudinary
  const uploadedFiles = req.files ? await processAndUploadMultiple(req.files) : [];

  const item = await createItem(req.body, uploadedFiles, req.user._id);

  // Return 201 immediately as per specification
  res.status(201).json({
    success: true,
    data: {
      item
    }
  });

  // Async embedding & matching hook triggered in the background
  const firstBuffer = uploadedFiles.length > 0 ? uploadedFiles[0].buffer : null;
  processItemEmbeddingAsync(item._id, firstBuffer).catch((err) => {
    console.error(`[Background Embedding] Failed for ${item._id}:`, err.message);
  });
};

export const list = async (req, res) => {
  const result = await getItems(req.query);
  res.status(200).json({
    success: true,
    data: {
      items: result.items
    },
    meta: result.meta
  });
};

export const getMine = async (req, res) => {
  const items = await getMyItems(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      items
    }
  });
};

export const getOne = async (req, res) => {
  const item = await getItemById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: {
      item
    }
  });
};

export const update = async (req, res) => {
  const item = await updateItem(req.params.id, req.body, req.user._id);
  res.status(200).json({
    success: true,
    data: {
      item
    }
  });
};

export const remove = async (req, res) => {
  const result = await deleteItem(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: result
  });
};

/**
 * Gets ranked matches for an item (owner or admin only)
 */
export const getMatches = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  const isOwner = item.reporter.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Only the item reporter or an admin can view item matches');
  }

  const matches = await getItemMatches(item._id);

  res.status(200).json({
    success: true,
    data: {
      matches,
      embeddingStatus: item.embeddingStatus
    }
  });
};

/**
 * Transient search by image without saving to DB
 */
export const searchImage = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    throw ApiError.badRequest('Please upload an image to search');
  }

  const { category, zone } = req.query;
  const matches = await searchByImage(req.file.buffer, category, zone);

  res.status(200).json({
    success: true,
    data: {
      matches
    }
  });
};

/**
 * Retries embedding computation if failed
 */
export const reEmbedItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  const isOwner = item.reporter.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Not authorized to re-embed this item');
  }

  item.embeddingStatus = 'pending';
  await item.save();

  // Trigger async re-embedding
  processItemEmbeddingAsync(item._id, null).catch(() => {});

  res.status(200).json({
    success: true,
    data: {
      message: 'Re-embedding initiated'
    }
  });
};
