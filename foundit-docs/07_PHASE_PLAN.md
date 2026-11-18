# Phase Plan (build strictly in order)

## Phase 1 - Foundation (Auth + Items CRUD)
- [ ] Monorepo scaffold, ESLint/Prettier, `.env.example`
- [ ] Express app, central error handler, Zod validation middleware, Helmet, CORS, rate limit
- [ ] Mongoose connection, User + Item models
- [ ] Register/login/refresh/logout/me with email-domain check
- [ ] Cloudinary upload service (sharp resize, max 3 images)
- [ ] Items CRUD + browse filters + pagination
- [ ] React app: auth pages, protected routes, report lost/found forms, browse grid, item detail, my items
**Done when:** a user can register, report lost and found items with photos, browse and filter them.

## Phase 2 - Embeddings + Matching
- [ ] `embedding.service.js` with CLIP singleton, warm-up on boot
- [ ] Store embeddings, embeddingStatus, retry endpoint
- [ ] Create Atlas vector index (doc 03)
- [ ] `matching.service.js`: retrieval, constraints, scoring, Match upsert
- [ ] Async trigger after item create/update
- [ ] `GET /items/:id/matches`, search-by-image endpoint
- [ ] Frontend: MatchCard, match list on item detail, landing image-search
**Done when:** reporting a found phone returns the correct lost-phone report in the top 3 for hand-made test cases.

## Phase 3 - Claims + Verification
- [ ] Verification question/answer hash on found items
- [ ] Claim model + endpoints, answer normalization (lowercase, trim, strip punctuation)
- [ ] Approve/reject/cancel, status transitions on items and matches
- [ ] Frontend: ClaimModal, Claims page (my/incoming)
**Done when:** end-to-end claim works, wrong answers are flagged, item statuses update correctly.

## Phase 4 - Real-time + Admin
- [ ] Socket.io auth + rooms, events from doc 04
- [ ] Notification model/endpoints, bell component
- [ ] Admin stats, desk items, claim queue, handover + log
- [ ] Frontend admin dashboard
**Done when:** a found report triggers a live toast to the matching lost reporter; admin can complete a handover.

## Phase 5 - Polish + Robustness
- [ ] Expiry cron job + expiry notifications
- [ ] BullMQ embedding queue (optional), retry with backoff
- [ ] Leaflet campus map pin (optional), QR code per desk item
- [ ] Image quality check (blur/dark), skeleton loaders, empty states, dark mode
- [ ] Rate limits finalized, request logging (pino)
**Done when:** app survives bad inputs, slow model, and failed uploads without crashing.

## Phase 6 - Evaluation + Deploy
- [ ] Build labeled evaluation set (doc 09), run `eval-matching.js`, tune weights
- [ ] Unit + integration tests (doc 09)
- [ ] Deploy (doc 10), seed demo data, record demo video
- [ ] README with architecture diagram, accuracy numbers, limitations
**Done when:** live URL works, README has measured top-1/top-3 accuracy.
