# Testing & Evaluation

## Unit tests (Vitest/Jest)
- Answer normalization + hashing
- Scoring function (weights, normalization, constraints)
- Zone adjacency, time decay
- Zod schemas

## Integration tests (Supertest + mongodb-memory-server)
- Auth flow incl. domain rejection
- Item create -> async match job (mock embedding service with deterministic vectors)
- Claim lifecycle and status transitions
- Authorization: non-owner cannot read matches, student cannot hit /admin

## Matching accuracy evaluation
Goal: produce a real number for your README/resume.
1. Collect **40-60 item pairs** (same object photographed twice: "lost" version with a phone-style casual photo, "found" version different angle/lighting). Use friends, hostel mates, and different categories (phones, bottles, bags, earbuds, wallets, keys, ID cards).
2. Add **100+ distractor** items (other students' items or open datasets).
3. Store as `eval/pairs.json`: `[{ lostImage, foundImage, lostText, foundText, category, zone }]`.
4. `scripts/eval-matching.js`: load all as items in a test DB, for each lost item rank all found items, compute top-1, top-3, top-5 accuracy and MRR.
5. Compare: image-only vs text-only vs combined weights. Put a small table in README.
6. Target: top-3 >= 70% combined. If lower, tune normalization bounds, weights, and image preprocessing.

## Manual QA checklist
- [ ] Upload very large image, wrong file type, corrupted image
- [ ] Report with no image (text-only matching)
- [ ] Two similar items from different users
- [ ] Wrong verification answer 3 times
- [ ] Socket reconnect after network drop
- [ ] Mobile Safari + Chrome Android camera upload
