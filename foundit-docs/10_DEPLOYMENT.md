# Deployment

## Services
- **DB:** MongoDB Atlas M0 free tier supports Vector Search for small collections; create the index from doc 03
- **API:** Render / Railway / a VPS. Model needs ~1 GB RAM; free tiers with 512 MB may crash. Options: (a) use a small VPS (2 GB), (b) move embedding to a separate FastAPI service on Hugging Face Spaces and call it over HTTP from Node, keeping the same `embedding.service.js` interface
- **Client:** Vercel or Netlify (set `VITE_API_URL`)
- **Images:** Cloudinary free tier

## Steps
1. Create Atlas cluster, user, IP allowlist; create vector index
2. Set env vars (doc 02) on API host; set `CLIENT_URL` to the deployed frontend
3. Build client, deploy; configure CORS + cookie `SameSite=None; Secure` if client and API are on different domains
4. Run `node scripts/seed.js` (admin user, zones, demo items)
5. Pre-download the CLIP model during build (`node scripts/warm-model.js`) so cold starts are fast
6. Smoke test: register -> report found -> report lost -> see match -> claim -> approve

## README must include
- Architecture diagram, screenshots/GIF of the flow
- How matching works (doc 05 summary) and measured accuracy table
- Known limitations
- Local setup in under 10 commands

## Resume bullets (fill with your real numbers)
- Built FoundIt, a MERN campus lost-and-found platform using CLIP embeddings and MongoDB Atlas Vector Search to match found-item photos with lost reports, achieving __% top-3 accuracy on a __-pair evaluation set
- Designed a weighted ranking pipeline combining image similarity, text similarity, location and time decay, with hidden-detail claim verification to prevent fraudulent claims
- Implemented real-time match alerts with Socket.io and an admin handover workflow with audit logging
