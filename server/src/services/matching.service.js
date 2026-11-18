import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { env } from '../config/env.js';
import { calculateLocationScore } from '../utils/geo.js';
import {
  cosineSimilarity,
  normalizeCosine,
  calculateTimeScore,
  clamp
} from '../utils/math.js';
import { embedImage } from './embedding.service.js';

/**
 * Checks hard constraints between lost and found items
 * Returns true if candidate passes all constraints
 */
export const checkHardConstraints = (lostItem, foundItem) => {
  // 1. Must belong to different reporters
  const lostReporter = lostItem.reporter?._id?.toString() || lostItem.reporter?.toString();
  const foundReporter = foundItem.reporter?._id?.toString() || foundItem.reporter?.toString();
  if (lostReporter && foundReporter && lostReporter === foundReporter) {
    return false;
  }

  // 2. Date constraint: found date must be >= lost date - 1 day, and within 30 days
  const lostDate = new Date(lostItem.dateEvent).getTime();
  const foundDate = new Date(foundItem.dateEvent).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * oneDayMs;

  if (foundDate < lostDate - oneDayMs) {
    return false;
  }
  if (foundDate > lostDate + thirtyDaysMs) {
    return false;
  }

  return true;
};

/**
 * Computes multi-signal score and breakdown between two items
 */
export const computeMatchScore = (itemA, itemB, isCategoryFallback = false) => {
  const lostItem = itemA.type === 'lost' ? itemA : itemB;
  const foundItem = itemA.type === 'found' ? itemA : itemB;

  // 1. Image similarity
  let rawImageSim = 0;
  const hasLostImage = lostItem.imageEmbedding && lostItem.imageEmbedding.length > 0;
  const hasFoundImage = foundItem.imageEmbedding && foundItem.imageEmbedding.length > 0;

  if (hasLostImage && hasFoundImage) {
    rawImageSim = cosineSimilarity(lostItem.imageEmbedding, foundItem.imageEmbedding);
  }
  const imageSim = normalizeCosine(rawImageSim);

  // 2. Text similarity
  let rawTextSim = 0;
  if (lostItem.textEmbedding && foundItem.textEmbedding) {
    rawTextSim = cosineSimilarity(lostItem.textEmbedding, foundItem.textEmbedding);
  } else if (lostItem.embedding && foundItem.embedding) {
    rawTextSim = cosineSimilarity(lostItem.embedding, foundItem.embedding);
  }
  const textSim = normalizeCosine(rawTextSim);

  // 3. Location score (adjacency map)
  const locationSc = calculateLocationScore(lostItem.zone, foundItem.zone);

  // 4. Time score (exponential decay)
  const lostDate = new Date(lostItem.dateEvent).getTime();
  const foundDate = new Date(foundItem.dateEvent).getTime();
  const daysBetween = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);
  const timeSc = calculateTimeScore(daysBetween);

  // Weighted score calculation
  let finalScore;
  if (hasLostImage && hasFoundImage) {
    finalScore = 0.55 * imageSim + 0.20 * textSim + 0.15 * locationSc + 0.10 * timeSc;
  } else {
    finalScore = 0.00 * imageSim + 0.60 * textSim + 0.25 * locationSc + 0.15 * timeSc;
  }

  // Apply 0.9 penalty if category filter had to be bypassed
  if (isCategoryFallback) {
    finalScore *= 0.9;
  }

  finalScore = clamp(finalScore, 0, 1);

  // Confidence rating
  let confidence = 'low';
  if (finalScore >= 0.75) {
    confidence = 'high';
  } else if (finalScore >= 0.55) {
    confidence = 'medium';
  }

  return {
    score: parseFloat(finalScore.toFixed(4)),
    confidence,
    breakdown: {
      image: parseFloat(imageSim.toFixed(3)),
      text: parseFloat(textSim.toFixed(3)),
      location: parseFloat(locationSc.toFixed(3)),
      time: parseFloat(timeSc.toFixed(3))
    }
  };
};

/**
 * Searches candidates and ranks matches for a given item
 */
export const findMatchesForItem = async (item) => {
  if (!item.embedding || item.embedding.length === 0) {
    return [];
  }

  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  // Step 1: Candidate retrieval with category filter
  let candidates = [];
  let isCategoryFallback = false;

  try {
    // Attempt MongoDB Atlas Vector Search
    candidates = await Item.aggregate([
      {
        $vectorSearch: {
          index: 'item_embedding_index',
          path: 'embedding',
          queryVector: item.embedding,
          numCandidates: 200,
          limit: 30,
          filter: {
            type: oppositeType,
            status: 'open',
            category: item.category
          }
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          zone: 1,
          dateEvent: 1,
          reporter: 1,
          images: 1,
          type: 1,
          embedding: 1,
          imageEmbedding: 1,
          textEmbedding: 1,
          vscore: { $meta: 'vectorSearchScore' }
        }
      }
    ]);
  } catch {
    // Atlas Vector Search fallback: query database and calculate similarity in-process
    candidates = await Item.find({
      type: oppositeType,
      status: 'open',
      category: item.category
    })
      .select('+embedding +imageEmbedding +textEmbedding')
      .limit(50)
      .lean();
  }

  // Fallback: If fewer than 5 candidates, retry without category filter
  if (candidates.length < 5) {
    try {
      const fallbackCandidates = await Item.find({
        type: oppositeType,
        status: 'open',
        category: { $ne: item.category }
      })
        .select('+embedding +imageEmbedding +textEmbedding')
        .limit(30)
        .lean();

      candidates = [...candidates, ...fallbackCandidates];
      isCategoryFallback = true;
    } catch {
      // Continue with current candidates
    }
  }

  // Step 2 & 3: Hard constraints filtering & multi-signal re-ranking
  const scoredMatches = [];

  for (const candidate of candidates) {
    const lostItem = item.type === 'lost' ? item : candidate;
    const foundItem = item.type === 'found' ? item : candidate;

    // Hard constraints check
    if (!checkHardConstraints(lostItem, foundItem)) {
      continue;
    }

    const { score, confidence, breakdown } = computeMatchScore(
      item,
      candidate,
      isCategoryFallback && candidate.category !== item.category
    );

    if (score >= env.MATCH_MIN_SCORE) {
      scoredMatches.push({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        candidate,
        score,
        confidence,
        breakdown
      });
    }
  }

  // Sort descending by score and keep top 5
  scoredMatches.sort((a, b) => b.score - a.score);
  const topMatches = scoredMatches.slice(0, 5);

  // Step 4: Persist matches in MongoDB
  const savedMatches = [];
  for (const m of topMatches) {
    const saved = await Match.findOneAndUpdate(
      { lostItem: m.lostItemId, foundItem: m.foundItemId },
      {
        lostItem: m.lostItemId,
        foundItem: m.foundItemId,
        score: m.score,
        confidence: m.confidence,
        breakdown: m.breakdown,
        status: 'suggested'
      },
      { upsert: true, new: true }
    );
    savedMatches.push(saved);
  }

  return savedMatches;
};

/**
 * Transient search by image without persisting
 */
export const searchByImage = async (imageBuffer, category = null, zone = null) => {
  const queryEmbedding = await embedImage(imageBuffer);

  const query = { type: 'found', status: 'open' };
  if (category) query.category = category;
  if (zone) query.zone = zone;

  const candidates = await Item.find(query)
    .select('+embedding +imageEmbedding +textEmbedding')
    .populate('reporter', 'name department')
    .limit(50)
    .lean();

  const results = [];
  for (const item of candidates) {
    let rawSim = 0;
    if (item.imageEmbedding && item.imageEmbedding.length > 0) {
      rawSim = cosineSimilarity(queryEmbedding, item.imageEmbedding);
    } else if (item.embedding && item.embedding.length > 0) {
      rawSim = cosineSimilarity(queryEmbedding, item.embedding);
    }

    const sim = normalizeCosine(rawSim);
    if (sim >= 0.3) {
      results.push({
        item: {
          ...item,
          reporter: item.reporter
            ? {
                firstName: item.reporter.name.split(' ')[0],
                department: item.reporter.department
              }
            : null
        },
        similarity: parseFloat(sim.toFixed(3))
      });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, 10);
};

/**
 * Gets ranked matches for a specific item
 */
export const getItemMatches = async (itemId) => {
  const matches = await Match.find({
    $or: [{ lostItem: itemId }, { foundItem: itemId }],
    status: { $ne: 'dismissed' }
  })
    .populate({
      path: 'lostItem',
      select: 'title description category zone dateEvent images reporter status',
      populate: { path: 'reporter', select: 'name department' }
    })
    .populate({
      path: 'foundItem',
      select: 'title description category zone dateEvent images heldAtDesk reporter status verificationQuestion',
      populate: { path: 'reporter', select: 'name department' }
    })
    .sort({ score: -1 })
    .lean();

  // Sanitize reporter info on items
  return matches.map((m) => {
    if (m.lostItem?.reporter) {
      m.lostItem.reporter = {
        firstName: m.lostItem.reporter.name.split(' ')[0],
        department: m.lostItem.reporter.department
      };
    }
    if (m.foundItem?.reporter) {
      m.foundItem.reporter = {
        firstName: m.foundItem.reporter.name.split(' ')[0],
        department: m.foundItem.reporter.department
      };
    }
    return m;
  });
};
