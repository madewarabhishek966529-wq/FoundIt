import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { Match } from '../models/Match.js';
import { HandoverLog } from '../models/HandoverLog.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';

export const getPlatformStats = async () => {
  const [
    openLostCount,
    openFoundCount,
    matchedCount,
    claimedCount,
    deskItemsCount,
    totalItems
  ] = await Promise.all([
    Item.countDocuments({ type: 'lost', status: 'open' }),
    Item.countDocuments({ type: 'found', status: 'open' }),
    Item.countDocuments({ status: 'matched' }),
    Item.countDocuments({ status: 'claimed' }),
    Item.countDocuments({ type: 'found', heldAtDesk: true, status: { $ne: 'claimed' } }),
    Item.countDocuments({})
  ]);

  const resolutionRate = totalItems > 0 ? parseFloat(((claimedCount / totalItems) * 100).toFixed(1)) : 0;

  return {
    openLostCount,
    openFoundCount,
    matchedCount,
    claimedCount,
    deskItemsCount,
    totalItems,
    resolutionRate
  };
};

export const getDeskItems = async () => {
  return Item.find({ heldAtDesk: true, status: { $in: ['open', 'matched'] } })
    .populate('reporter', 'name department')
    .sort({ createdAt: -1 })
    .lean();
};

export const getAdminClaimsQueue = async (status = 'pending') => {
  const query = status ? { status } : {};

  return Claim.find(query)
    .populate('claimant', 'name email department phone')
    .populate('foundItem', 'title category zone dateEvent images heldAtDesk verificationQuestion')
    .populate('lostItem', 'title category zone dateEvent images')
    .sort({ createdAt: -1 })
    .lean();
};

export const completeHandover = async ({ claimId, idChecked, note = '' }, adminUser) => {
  if (!idChecked) {
    throw ApiError.badRequest('Physical ID verification is required before item handover');
  }

  const claim = await Claim.findById(claimId)
    .populate('foundItem')
    .populate('claimant');

  if (!claim) {
    throw ApiError.notFound('Claim not found');
  }

  if (claim.status === 'approved' && claim.foundItem?.status === 'claimed') {
    // Check if already handed over
    const existingLog = await HandoverLog.findOne({ claim: claimId });
    if (existingLog) {
      throw ApiError.badRequest('Handover has already been logged for this claim');
    }
  }

  // Update claim & items
  claim.status = 'approved';
  claim.handledBy = adminUser._id;
  claim.handledAt = new Date();
  await claim.save();

  await Promise.all([
    Item.findByIdAndUpdate(claim.foundItem._id, { status: 'claimed' }),
    Item.findByIdAndUpdate(claim.lostItem, { status: 'claimed' }),
    claim.match ? Match.findByIdAndUpdate(claim.match, { status: 'confirmed' }) : Promise.resolve()
  ]);

  // Create HandoverLog
  const log = await HandoverLog.create({
    foundItem: claim.foundItem._id,
    claim: claim._id,
    givenTo: claim.claimant._id,
    handledBy: adminUser._id,
    idChecked: true,
    note,
    handedAt: new Date()
  });

  // Notify student
  await createNotification({
    userId: claim.claimant._id,
    type: 'claim_update',
    message: `Your claim for "${claim.foundItem.title}" has been completed and handed over at the Security Desk.`,
    link: `/claims`
  });

  return log;
};

export const getHandoverLogs = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    HandoverLog.find({})
      .populate('foundItem', 'title category zone images')
      .populate('givenTo', 'name department email')
      .populate('handledBy', 'name')
      .sort({ handedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    HandoverLog.countDocuments({})
  ]);

  return {
    logs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
