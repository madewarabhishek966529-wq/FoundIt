import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateItemEmbedding } from '../src/services/embedding.service.js';
import { computeMatchScore } from '../src/services/matching.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pairsPath = path.resolve(__dirname, '../eval/pairs.json');

const runEvaluation = async () => {
  console.log('====================================================');
  console.log('📊 FoundIt Multimodal Matching Engine Evaluation');
  console.log('====================================================\n');

  if (!fs.existsSync(pairsPath)) {
    console.error('Benchmark pairs file not found:', pairsPath);
    process.exit(1);
  }

  const testPairs = JSON.parse(fs.readFileSync(pairsPath, 'utf-8'));
  console.log(`Loaded ${testPairs.length} labeled test item pairs with distractors.`);

  let top1Hits = 0;
  let top3Hits = 0;
  let top5Hits = 0;
  let reciprocalRankSum = 0;
  const totalQueries = testPairs.length;

  for (let i = 0; i < testPairs.length; i++) {
    const pair = testPairs[i];
    console.log(`\nEvaluating query ${i + 1}/${totalQueries}: [${pair.category}] "${pair.lostTitle}"`);

    // 1. Lost item
    const lostItem = {
      type: 'lost',
      category: pair.category,
      zone: pair.zone,
      title: pair.lostTitle,
      description: pair.lostText,
      dateEvent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    const lostEmbeddings = await generateItemEmbedding(lostItem);
    lostItem.embedding = lostEmbeddings.embedding;
    lostItem.textEmbedding = lostEmbeddings.textEmbedding;

    // 2. Candidate pool: Ground truth found item + distractors
    const candidates = [];

    // True match
    const trueFound = {
      id: 'true-match',
      type: 'found',
      category: pair.category,
      zone: pair.zone,
      title: pair.foundTitle,
      description: pair.foundText,
      dateEvent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    const trueFoundEmb = await generateItemEmbedding(trueFound);
    trueFound.embedding = trueFoundEmb.embedding;
    trueFound.textEmbedding = trueFoundEmb.textEmbedding;
    candidates.push(trueFound);

    // Distractors
    for (let d = 0; d < pair.distractors.length; d++) {
      const dist = pair.distractors[d];
      const distItem = {
        id: `distractor-${d}`,
        type: 'found',
        category: dist.category,
        zone: dist.zone,
        title: dist.title,
        description: dist.title,
        dateEvent: new Date()
      };
      const distEmb = await generateItemEmbedding(distItem);
      distItem.embedding = distEmb.embedding;
      distItem.textEmbedding = distEmb.textEmbedding;
      candidates.push(distItem);
    }

    // Score all candidates
    const scoredCandidates = candidates.map((cand) => {
      const { score, confidence, breakdown } = computeMatchScore(lostItem, cand);
      return {
        id: cand.id,
        title: cand.title,
        score,
        confidence,
        breakdown
      };
    });

    // Rank descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    const rank = scoredCandidates.findIndex((c) => c.id === 'true-match') + 1;
    console.log(`  -> True match ranked at #${rank} (Score: ${scoredCandidates[rank - 1].score})`);

    if (rank === 1) top1Hits++;
    if (rank <= 3) top3Hits++;
    if (rank <= 5) top5Hits++;
    reciprocalRankSum += 1.0 / rank;
  }

  const top1Acc = ((top1Hits / totalQueries) * 100).toFixed(1);
  const top3Acc = ((top3Hits / totalQueries) * 100).toFixed(1);
  const top5Acc = ((top5Hits / totalQueries) * 100).toFixed(1);
  const mrr = (reciprocalRankSum / totalQueries).toFixed(3);

  console.log('\n====================================================');
  console.log('📈 Benchmark Results Summary');
  console.log('====================================================');
  console.log(`Total Evaluation Pairs: ${totalQueries}`);
  console.log(`Top-1 Accuracy:         ${top1Acc}%`);
  console.log(`Top-3 Accuracy:         ${top3Acc}% (Target: >= 70%)`);
  console.log(`Top-5 Accuracy:         ${top5Acc}%`);
  console.log(`Mean Reciprocal Rank:   ${mrr}`);
  console.log('====================================================\n');
};

runEvaluation().catch((err) => {
  console.error('Error during evaluation:', err);
  process.exit(1);
});
