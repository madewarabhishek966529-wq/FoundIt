# FoundIt - Campus Lost & Found with Visual Matching

MERN project doc pack. Feed files to the AI IDE (Antigravity) in this order:

| # | File | Purpose |
|---|------|---------|
| 00 | 00_MASTER_PROMPT.md | Paste first. Sets role, rules, stack, workflow |
| 01 | 01_PRD.md | Product scope, users, features, non-goals |
| 02 | 02_ARCHITECTURE.md | System design, folder structure, tech choices |
| 03 | 03_DATABASE_SCHEMA.md | Mongoose models, indexes, vector index |
| 04 | 04_API_SPEC.md | All REST endpoints + socket events |
| 05 | 05_MATCHING_ENGINE.md | Embeddings, scoring, thresholds (core of project) |
| 06 | 06_FRONTEND_SPEC.md | Pages, components, UX flows |
| 07 | 07_PHASE_PLAN.md | 6 build phases with checklists and done-criteria |
| 08 | 08_SECURITY_PRIVACY.md | Auth, claim verification, privacy rules |
| 09 | 09_TESTING_EVAL.md | Tests + matching accuracy evaluation |
| 10 | 10_DEPLOYMENT.md | Deploy steps, env vars, resume bullets |

Workflow: master prompt -> PRD + architecture -> one phase at a time. Never skip phase done-criteria.
