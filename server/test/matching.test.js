import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkHardConstraints,
  computeMatchScore
} from '../src/services/matching.service.js';
import { calculateLocationScore } from '../src/utils/geo.js';
import {
  dotProduct,
  l2Normalize,
  cosineSimilarity,
  normalizeCosine,
  calculateTimeScore,
  magnitude
} from '../src/utils/math.js';
import { generateItemEmbedding } from '../src/services/embedding.service.js';

test('Vector Math: L2 normalize produces unit vector with magnitude 1.0', () => {
  const v = [3, 4, 0];
  const normalized = l2Normalize(v);
  assert.equal(normalized[0], 0.6);
  assert.equal(normalized[1], 0.8);
  assert.equal(normalized[2], 0);

  const mag = magnitude(normalized);
  assert.ok(Math.abs(mag - 1.0) < 1e-6);
});

test('Vector Math: Cosine similarity of identical vectors is 1.0 and orthogonal vectors is 0.0', () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];

  assert.equal(cosineSimilarity(v1, v2), 1.0);
  assert.equal(cosineSimilarity(v1, v3), 0.0);
});

test('Zone Adjacency: produces 1.0 for same zone, 0.6 for adjacent, and 0.2 for distant', () => {
  assert.equal(calculateLocationScore('Library', 'Library'), 1.0);
  assert.equal(calculateLocationScore('Main Gate', 'Admin Block'), 0.6);
  assert.equal(calculateLocationScore('Main Gate', 'Hostel A'), 0.2);
});

test('Time Decay: exp(-daysBetween / 7) decays predictably over time', () => {
  const day0 = calculateTimeScore(0);
  const day7 = calculateTimeScore(7);
  const day14 = calculateTimeScore(14);

  assert.equal(day0, 1.0);
  assert.ok(Math.abs(day7 - Math.exp(-1)) < 1e-6);
  assert.ok(day14 < day7);
});

test('Hard Constraints: rejects candidates with the same reporter', () => {
  const lost = {
    reporter: '507f191e810c19729de860ea',
    dateEvent: new Date('2026-11-10T10:00:00Z')
  };
  const found = {
    reporter: '507f191e810c19729de860ea',
    dateEvent: new Date('2026-11-11T10:00:00Z')
  };

  assert.equal(checkHardConstraints(lost, found), false);
});

test('Hard Constraints: rejects found dates earlier than lost date minus 1 day', () => {
  const lost = {
    reporter: 'user1',
    dateEvent: new Date('2026-11-10T10:00:00Z')
  };
  const found = {
    reporter: 'user2',
    dateEvent: new Date('2026-11-05T10:00:00Z') // 5 days before lost
  };

  assert.equal(checkHardConstraints(lost, found), false);
});

test('Hard Constraints: rejects found dates greater than 30 days after lost date', () => {
  const lost = {
    reporter: 'user1',
    dateEvent: new Date('2026-10-01T10:00:00Z')
  };
  const found = {
    reporter: 'user2',
    dateEvent: new Date('2026-11-15T10:00:00Z') // 45 days after lost
  };

  assert.equal(checkHardConstraints(lost, found), false);
});

test('Hard Constraints: accepts valid pair with different reporter and reasonable timeframe', () => {
  const lost = {
    reporter: 'user1',
    dateEvent: new Date('2026-11-10T10:00:00Z')
  };
  const found = {
    reporter: 'user2',
    dateEvent: new Date('2026-11-11T14:00:00Z') // 1 day after lost
  };

  assert.equal(checkHardConstraints(lost, found), true);
});

test('Scoring Engine: computes multi-signal score and ranks confidence correctly', () => {
  // Mock 512-dim normalized vectors
  const vec1 = l2Normalize(new Array(512).fill(1));
  const vec2 = l2Normalize(new Array(512).fill(1));

  const lostItem = {
    type: 'lost',
    category: 'phone',
    zone: 'CS Dept',
    dateEvent: new Date('2026-11-10T10:00:00Z'),
    imageEmbedding: vec1,
    textEmbedding: vec1
  };

  const foundItem = {
    type: 'found',
    category: 'phone',
    zone: 'CS Dept',
    dateEvent: new Date('2026-11-10T12:00:00Z'),
    imageEmbedding: vec2,
    textEmbedding: vec2
  };

  const result = computeMatchScore(lostItem, foundItem);
  assert.ok(result.score >= 0.75);
  assert.equal(result.confidence, 'high');
  assert.equal(result.breakdown.location, 1.0);
});

test('Embedding Service: generates 512-dim normalized embedding vectors', async () => {
  const item = {
    category: 'phone',
    title: 'iPhone 13 Midnight Blue',
    description: 'Black bumper case with stickers',
    color: 'Midnight Blue',
    brand: 'Apple'
  };

  const embeddings = await generateItemEmbedding(item);
  assert.ok(Array.isArray(embeddings.embedding));
  assert.equal(embeddings.embedding.length, 512);

  const mag = magnitude(embeddings.embedding);
  assert.ok(Math.abs(mag - 1.0) < 1e-4);
});
