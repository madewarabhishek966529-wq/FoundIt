import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizeAnswer, hashVerificationAnswer } from './item.service.js';

export const submitClaim = async (data, claimantId) => {
  let { matchId, lostItemId, foundItemId, answer = '', proofNote = '' } = data;

  if (matchId) {
    const match = await Match.findById(matchId);
    if (!match) {
      throw ApiError.notFound('Associated match not found');
    }
    lostItemId = match.lostItem.toString();
    foundItemId = match.foundItem.toString();
  }

  // Verify found item
  const foundItem = await Item.findById(foundItemId).select('+verificationAnswerHash');
  if (!foundItem) {
    throw ApiError.notFound('Found item not found');
  }

  if (foundItem.reporter.toString() === claimantId.toString()) {
    throw ApiError.badRequest('You cannot claim an item you reported as found');
  }

  if (foundItem.status === 'claimed' || foundItem.status === 'closed') {
    throw ApiError.badRequest('This item has already been claimed or closed');
  }

  // Anti-Fraud Rule: Max 3 attempts per user per item
  const previousAttempts = await Claim.countDocuments({
    foundItem: foundItemId,
    claimant: claimantId
  });

  if (previousAttempts >= 3) {
    throw ApiError.forbidden(
      'Maximum 3 claim attempts reached for this item. Please contact Campus Security directly.',
      'MAX_CLAIM_ATTEMPTS_EXCEEDED'
    );
  }

  // Check answer correctness securely
  let answerCorrect = false;
  if (foundItem.verificationAnswerHash && answer.trim()) {
    const normalized = normalizeAnswer(answer);
    const candidateHash = hashVerificationAnswer(normalized);
    answerCorrect = candidateHash === foundItem.verificationAnswerHash;
  } else if (!foundItem.verificationAnswerHash) {
    // If finder did not set a verification question, flag as manual review
    answerCorrect = true;
  }

  const claim = await Claim.create({
    match: matchId || undefined,
    lostItem: lostItemId,
    foundItem: foundItemId,
    claimant: claimantId,
    answer,
    answerCorrect,
    proofNote,
    status: 'pending'
  });

  if (matchId) {
    await Match.findByIdAndUpdate(matchId, { status: 'claimed' }).catch(() => {});
  }

  return claim;
};

export const getMyClaims = async (userId) => {
  const claims = await Claim.find({ claimant: userId })
    .populate('lostItem', 'title category zone dateEvent images')
    .populate('foundItem', 'title category zone dateEvent images heldAtDesk')
    .sort({ createdAt: -1 })
    .lean();

  return claims;
};

export const getIncomingClaims = async (userId) => {
  // Find all found items reported by this user
  const myFoundItems = await Item.find({ reporter: userId, type: 'found' }).select('_id');
  const foundItemIds = myFoundItems.map((i) => i._id);

  const claims = await Claim.find({ foundItem: { $in: foundItemIds } })
    .populate('claimant', 'name department')
    .populate('foundItem', 'title category zone dateEvent images heldAtDesk')
    .populate('lostItem', 'title description dateEvent images')
    .sort({ createdAt: -1 })
    .lean();

  return claims;
};

export const approveClaim = async (claimId, user) => {
  const claim = await Claim.findById(claimId).populate('foundItem');
  if (!claim) {
    throw ApiError.notFound('Claim not found');
  }

  const isFinder = claim.foundItem?.reporter?.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isFinder && !isAdmin) {
    throw ApiError.forbidden('Only the item finder or an admin can approve this claim');
  }

  if (claim.status !== 'pending') {
    throw ApiError.badRequest(`Cannot approve a claim with status '${claim.status}'`);
  }

  claim.status = 'approved';
  claim.handledBy = user._id;
  claim.handledAt = new Date();
  await claim.save();

  // Update statuses on items and match
  await Promise.all([
    Item.findByIdAndUpdate(claim.foundItem._id, { status: 'claimed' }),
    Item.findByIdAndUpdate(claim.lostItem, { status: 'claimed' }),
    claim.match ? Match.findByIdAndUpdate(claim.match, { status: 'confirmed' }) : Promise.resolve()
  ]);

  return claim;
};

export const rejectClaim = async (claimId, reason, user) => {
  const claim = await Claim.findById(claimId).populate('foundItem');
  if (!claim) {
    throw ApiError.notFound('Claim not found');
  }

  const isFinder = claim.foundItem?.reporter?.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isFinder && !isAdmin) {
    throw ApiError.forbidden('Only the item finder or an admin can reject this claim');
  }

  if (claim.status !== 'pending') {
    throw ApiError.badRequest(`Cannot reject a claim with status '${claim.status}'`);
  }

  claim.status = 'rejected';
  claim.rejectReason = reason;
  claim.handledBy = user._id;
  claim.handledAt = new Date();
  await claim.save();

  return claim;
};

export const cancelClaim = async (claimId, userId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw ApiError.notFound('Claim not found');
  }

  if (claim.claimant.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only cancel your own claims');
  }

  if (claim.status !== 'pending') {
    throw ApiError.badRequest(`Cannot cancel a claim with status '${claim.status}'`);
  }

  claim.status = 'cancelled';
  await claim.save();

  return claim;
};
