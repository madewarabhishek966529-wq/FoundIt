# API Spec (base `/api/v1`)

Response shape: `{ success:true, data, meta? }` or `{ success:false, error:{ code, message, details? } }`.

## Auth
| Method | Path | Notes |
|---|---|---|
| POST | /auth/register | name, email (domain-checked), password (min 8), department |
| POST | /auth/login | returns access token, sets refresh cookie |
| POST | /auth/refresh | rotates access token |
| POST | /auth/logout | clears cookie |
| GET | /auth/me | current user |

## Items
| Method | Path | Notes |
|---|---|---|
| POST | /items | multipart: fields + `images` (max 3). Saves, returns 201, kicks off async embedding + matching |
| GET | /items | query: `type, category, zone, status, q, from, to, page, limit, sort` |
| GET | /items/mine | caller's reports |
| GET | /items/:id | public view (no verification question text unless claimant context, no contact info) |
| PATCH | /items/:id | owner only, while status=open |
| DELETE | /items/:id | owner or admin |
| GET | /items/:id/matches | ranked matches for this item (owner or admin) |
| POST | /items/search-by-image | multipart `image`: transient search, embeds and returns top-10 without saving |

## Matches
| Method | Path | Notes |
|---|---|---|
| PATCH | /matches/:id/dismiss | owner dismisses a suggestion |
| GET | /matches/mine | all suggestions across caller's items |

## Claims
| Method | Path | Notes |
|---|---|---|
| POST | /claims | body: `matchId` or (`lostItem`,`foundItem`), `answer`, `proofNote`. Server checks answer against hash |
| GET | /claims/mine | claims I made |
| GET | /claims/incoming | claims on found items I reported |
| PATCH | /claims/:id/approve | finder or admin |
| PATCH | /claims/:id/reject | body: `reason` |
| PATCH | /claims/:id/cancel | claimant |

## Notifications
`GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

## Admin (role=admin)
| Method | Path | Notes |
|---|---|---|
| GET | /admin/stats | counts: open lost/found, matched, claimed, success rate |
| GET | /admin/desk-items | found items with heldAtDesk=true |
| GET | /admin/claims?status= | pending claims queue |
| POST | /admin/handover | body: `claimId, idChecked, note` -> sets claim approved, items claimed, writes HandoverLog |
| GET | /admin/handover-log | paginated |

## Socket.io events
Auth via `auth: { token }` on connect. Server joins socket to room `user:<id>`.
- `match:new` -> `{ matchId, itemId, score, confidence }`
- `claim:received` -> `{ claimId, itemId }`
- `claim:updated` -> `{ claimId, status }`
- `notification:new` -> notification doc

## Rate limits
Auth routes 10/min/IP. Item create 10/hour/user. Search-by-image 20/hour/user.
