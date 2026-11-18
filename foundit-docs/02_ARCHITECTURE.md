# Architecture

```
React (Vite) --REST/Socket.io--> Express API --> MongoDB Atlas (data + vector index)
                                     |--> Cloudinary (images)
                                     |--> CLIP model in-process (transformers.js)
                                     |--> BullMQ/Redis (optional embedding queue)
```

## Monorepo layout
```
foundit/
  client/
    src/
      api/            axios instance + query hooks
      components/     ui/, items/, matches/, claims/, layout/
      pages/          Landing, Login, Register, Browse, ReportLost, ReportFound,
                      ItemDetail, Matches, MyItems, Claims, AdminDashboard
      store/          authStore.js, uiStore.js
      hooks/          useSocket.js, useDebounce.js
      utils/
    index.html
  server/
    src/
      config/         env.js, db.js, cloudinary.js
      models/         User, Item, Match, Claim, Notification, HandoverLog
      routes/         auth, items, matches, claims, notifications, admin
      controllers/
      services/
        embedding.service.js   (CLIP load + image/text embed)
        matching.service.js    (vector search + scoring)
        item.service.js
        claim.service.js
        notification.service.js
        upload.service.js
      middleware/     auth.js, role.js, validate.js, upload.js, errorHandler.js, rateLimit.js
      validators/     zod schemas
      jobs/           expiry.job.js, embedding.queue.js (optional)
      sockets/        index.js
      utils/          ApiError.js, asyncHandler.js, geo.js
      app.js
      server.js
    scripts/          seed.js, create-vector-index.md, eval-matching.js
    .env.example
```

## Key decisions
- **CLIP in Node**: model loaded once at server boot (singleton), ~150 MB download cached on disk. Warm up on startup. Embedding takes ~300-800 ms on CPU.
- **Joint space**: CLIP image and text embeddings are comparable, so text-only lost reports can match found photos.
- **Matching runs async** after the item is saved: respond 201 immediately, then compute embedding + matches, emit socket event.
- **Vector search**: Atlas `$vectorSearch` with pre-filters (`type`, `category`, `status`). Re-rank in Node with the weighted score.
- **Auth**: access token 15 min (memory), refresh token 7 days (httpOnly cookie).
- **Images**: client sends multipart; server resizes to max 1024 px (sharp), uploads to Cloudinary, embeds from the resized buffer.

## Environment variables
```
PORT=5000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
ALLOWED_EMAIL_DOMAIN=yourcollege.edu.in
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ITEM_EXPIRY_DAYS=60
MATCH_MIN_SCORE=0.45
REDIS_URL=            # optional
```
