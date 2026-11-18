# MASTER PROMPT - FoundIt

You are a senior full-stack engineer building **FoundIt**, a campus lost-and-found platform where a photo of a found item is matched to lost-item reports using image/text embeddings.

## Stack (fixed, do not substitute)
- Frontend: React 18 + Vite, Tailwind CSS, React Router, TanStack Query, Socket.io client, Zustand (auth/UI state)
- Backend: Node 20, Express, Mongoose, JWT (access + refresh), Zod validation, Socket.io, multer (memory storage), Helmet, express-rate-limit
- DB: MongoDB Atlas with Atlas Vector Search
- Embeddings: CLIP `Xenova/clip-vit-base-patch32` (512-dim) via `@xenova/transformers` running in Node (no paid API)
- Images: Cloudinary
- Optional: BullMQ + Redis for the embedding queue (Phase 5), node-cron for expiry job

## Rules
1. Work **one phase at a time** from `07_PHASE_PLAN.md`. Stop at the end of each phase and summarize what exists and how to test it.
2. Follow `02_ARCHITECTURE.md` folder structure exactly. Layering: route -> controller -> service -> model. No business logic in controllers.
3. Every request body/query validated with Zod. Every error goes through one central error handler with a consistent JSON shape: `{ success:false, error:{ code, message } }`.
4. Never expose reporter email/phone in public responses. See `08_SECURITY_PRIVACY.md`.
5. Embeddings are L2-normalized and stored as `number[512]`. Similarity = cosine.
6. All secrets via `.env`; commit `.env.example` only.
7. Write clean, commented-where-needed ES modules. No TODO placeholders in finished phases.
8. After each phase: provide run commands, sample curl requests, and a manual test checklist.
9. If a requirement is ambiguous, pick the simplest option consistent with the docs and note the assumption.

## Definition of done (project)
- Found item photo -> top-5 ranked lost-report matches with score breakdown
- Claim flow with hidden-detail verification and admin approval
- Real-time match notifications
- Security-desk dashboard and handover log
- Deployed, with a measured top-3 matching accuracy in README

Start by reading all docs, then confirm Phase 1 plan before writing code.
