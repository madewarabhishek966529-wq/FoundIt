import crypto from 'crypto';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const normalizeAnswer = (answer = '') => {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');
};

export const hashVerificationAnswer = (normalizedAnswer) => {
  return crypto.createHash('sha256').update(normalizedAnswer).digest('hex');
};

export const createItem = async (data, files, userId) => {
  const {
    type,
    title,
    description,
    category,
    zone,
    dateEvent,
    color,
    brand,
    heldAtDesk,
    verificationQuestion,
    verificationAnswer,
    lat,
    lng
  } = data;

  if (type === 'found' && (!files || files.length === 0)) {
    throw ApiError.badRequest('Photo is required when reporting a found item');
  }

  // Handle uploaded images
  const images = (files || []).map((img) => ({
    url: img.url,
    publicId: img.publicId || ''
  }));

  // Handle verification answer hash if provided
  let verificationAnswerHash = undefined;
  if (type === 'found' && verificationAnswer) {
    const normalized = normalizeAnswer(verificationAnswer);
    verificationAnswerHash = hashVerificationAnswer(normalized);
  }

  // Location coordinates if provided
  let location = undefined;
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };
  }

  // Expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.ITEM_EXPIRY_DAYS);

  const item = await Item.create({
    type,
    title,
    description,
    category,
    images,
    zone,
    location,
    dateEvent: new Date(dateEvent),
    color,
    brand,
    reporter: userId,
    heldAtDesk: type === 'found' ? Boolean(heldAtDesk) : false,
    verificationQuestion: type === 'found' ? verificationQuestion : undefined,
    verificationAnswerHash,
    expiresAt,
    status: 'open',
    embeddingStatus: 'pending'
  });

  return item;
};

export const getItems = async (filters = {}) => {
  const {
    type,
    category,
    zone,
    status,
    q,
    from,
    to,
    page = 1,
    limit = 12,
    sort = 'newest'
  } = filters;

  const query = {};

  if (type) query.type = type;
  if (category) query.category = category;
  if (zone) query.zone = zone;
  if (status) query.status = status;
  else query.status = { $in: ['open', 'matched'] }; // default to active items

  if (q && q.trim()) {
    query.$text = { $search: q.trim() };
  }

  if (from || to) {
    query.dateEvent = {};
    if (from) query.dateEvent.$gte = new Date(from);
    if (to) query.dateEvent.$lte = new Date(to);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'dateEvent') sortOption = { dateEvent: -1 };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Item.find(query)
      .select('-verificationQuestion -verificationAnswerHash -embedding -imageEmbedding -textEmbedding')
      .populate('reporter', 'name department')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Item.countDocuments(query)
  ]);

  // Sanitize reporter names and ID cards
  const sanitizedItems = items.map((item) => {
    const isIdCard = item.category === 'id-card';
    return {
      ...item,
      reporter: item.reporter
        ? {
            id: item.reporter._id,
            firstName: item.reporter.name.split(' ')[0],
            department: item.reporter.department
          }
        : null,
      isSensitiveDocument: isIdCard
    };
  });

  return {
    items: sanitizedItems,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMyItems = async (userId) => {
  const items = await Item.find({ reporter: userId })
    .select('-embedding -imageEmbedding -textEmbedding')
    .sort({ createdAt: -1 })
    .lean();

  return items;
};

export const getItemById = async (itemId, user = null) => {
  const item = await Item.findById(itemId)
    .populate('reporter', 'name department')
    .lean();

  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  const isOwner = user && item.reporter && item.reporter._id.toString() === user._id.toString();
  const isAdmin = user && user.role === 'admin';

  const sanitized = {
    ...item,
    reporter: item.reporter
      ? {
          id: item.reporter._id,
          firstName: item.reporter.name.split(' ')[0],
          department: item.reporter.department
        }
      : null,
    // Hide verification question unless owner, admin, or initiating claim
    verificationQuestion: isOwner || isAdmin ? item.verificationQuestion : Boolean(item.verificationQuestion)
  };

  delete sanitized.verificationAnswerHash;
  delete sanitized.embedding;
  delete sanitized.imageEmbedding;
  delete sanitized.textEmbedding;

  return sanitized;
};

export const updateItem = async (itemId, updateData, userId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  if (item.reporter.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only edit items you reported');
  }

  if (item.status !== 'open') {
    throw ApiError.badRequest('Only open items can be modified');
  }

  const allowedFields = ['title', 'description', 'category', 'zone', 'dateEvent', 'color', 'brand'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      item[field] = updateData[field];
    }
  });

  await item.save();
  return item;
};

export const deleteItem = async (itemId, user) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  const isOwner = item.reporter.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this item');
  }

  await item.deleteOne();
  return { message: 'Item deleted successfully' };
};
