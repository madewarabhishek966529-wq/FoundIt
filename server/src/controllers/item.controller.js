import {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem
} from '../services/item.service.js';
import { processAndUploadMultiple } from '../services/upload.service.js';

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

  // Async embedding & matching hook will be triggered here in Phase 2
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
