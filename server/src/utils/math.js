/**
 * Vector and Matching Math Utilities
 */

export const dotProduct = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
};

export const magnitude = (vec) => {
  if (!vec || vec.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
};

export const l2Normalize = (vec) => {
  const mag = magnitude(vec);
  if (mag === 0) return new Array(vec.length).fill(0);
  return Array.from(vec).map((val) => val / mag);
};

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;

  return dotProduct(vecA, vecB) / (magA * magB);
};

export const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};

/**
 * Normalizes raw CLIP cosine similarity
 * CLIP image similarities typically fall within 0.55 - 0.95
 */
export const normalizeCosine = (sim) => {
  return clamp((sim - 0.55) / (0.95 - 0.55), 0, 1);
};

/**
 * Exponential time decay: exp(-daysBetween / 7)
 */
export const calculateTimeScore = (daysBetween) => {
  const days = Math.max(0, daysBetween);
  return Math.exp(-days / 7);
};
