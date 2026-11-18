# Matching Engine (core of the project)

## 1. Embedding service (`embedding.service.js`)
- Load once at boot: `CLIPVisionModelWithProjection`, `CLIPTextModelWithProjection`, `AutoProcessor`, `AutoTokenizer` from `Xenova/clip-vit-base-patch32` using `@xenova/transformers`.
- `embedImage(buffer)` -> `Float32Array(512)` -> L2 normalize -> `number[]`
- `embedText(string)` -> same, text truncated to 77 tokens.
- Item embedding = normalize( `0.7 * imageEmb + 0.3 * textEmb` ) when both exist; image-only or text-only otherwise. Also store `imageEmb` and `textEmb` separately if you need the per-signal breakdown (recommended: add `imageEmbedding` and `textEmbedding` fields, keep `embedding` as the combined vector for `$vectorSearch`).
- Text input string: `"{category} {color} {brand} {title}. {description}"`
- Prompt trick: wrap as `"a photo of " + text` for text embeddings, which improves CLIP alignment.
- Handle failure: set `embeddingStatus='failed'`, log, allow retry via admin endpoint.

## 2. Candidate retrieval
On new item X (type T), search opposite type `O`:
```js
db.items.aggregate([
  { $vectorSearch: {
      index: 'item_embedding_index',
      path: 'embedding',
      queryVector: X.embedding,
      numCandidates: 200,
      limit: 30,
      filter: { type: O, status: 'open', category: X.category }
  }},
  { $project: { title:1, description:1, zone:1, dateEvent:1, location:1,
                images:1, imageEmbedding:1, textEmbedding:1,
                vscore: { $meta: 'vectorSearchScore' } } }
])
```
Category filter fallback: if fewer than 5 candidates, retry without the category filter and apply a 0.9 multiplier to the final score.

## 3. Hard constraints (drop candidate if violated)
- Found `dateEvent` must be >= lost `dateEvent` minus 1 day (clock tolerance)
- Found `dateEvent` must be within 30 days after lost `dateEvent`
- Candidate belongs to a different reporter

## 4. Scoring
```
imageSim   = cosine(X.imageEmb, C.imageEmb)         // 0 if either missing
textSim    = cosine(X.textEmb,  C.textEmb)
locationSc = zone match ? 1 : adjacentZone ? 0.6 : 0.2     // use zone adjacency map
timeSc     = exp(-daysBetween / 7)
```
Normalize raw cosine (CLIP image-image sims are ~0.5-1.0) with min-max: `norm = clamp((sim - 0.55) / (0.95 - 0.55), 0, 1)`.

Weights:
- both images present: `0.55*image + 0.20*text + 0.15*location + 0.10*time`
- one side has no image: `0.00*image + 0.60*text + 0.25*location + 0.15*time`

Confidence: `high >= 0.75`, `medium >= 0.55`, `low >= MATCH_MIN_SCORE (0.45)`. Below that, no Match is stored.

## 5. Persisting
Upsert `Match` for every candidate above threshold (top 5 only). Notify the lost-item reporter if X is found, or each lost reporter if X is... (for a new LOST item, notify the lost reporter with existing found items; for a new FOUND item, notify every affected lost reporter, once per match, only when confidence >= medium for push notifications).

## 6. Also run on
- Item update (re-embed if image/title/description changed)
- Nightly job: re-run matching for open lost items vs found items created that day (catches model/threshold changes)

## 7. Tuning
Use `scripts/eval-matching.js` against the labeled set from `09_TESTING_EVAL.md`. Grid-search the weights and normalization bounds. Record the final numbers in README.

## 8. Known limits (state them honestly in README)
- CLIP confuses near-identical items (two black phones). The verification question exists for exactly this reason.
- Needs reasonable photo quality; add client-side blur/dark check warning.
