# Database Schema (Mongoose)

## User
```js
{
  name: String (req),
  email: String (req, unique, lowercase),
  passwordHash: String (req, select:false),
  role: { type: String, enum: ['student','admin'], default: 'student' },
  department: String,
  phone: String (select:false),
  createdAt, updatedAt
}
```

## Item (lost and found in one collection)
```js
{
  type: { enum: ['lost','found'], required, index },
  title: String (req, max 100),
  description: String (max 1000),
  category: { enum: CATEGORIES, required, index },
  images: [{ url: String, publicId: String }],   // max 3
  embedding: { type: [Number], select:false },   // 512-dim, normalized
  embeddingStatus: { enum: ['pending','ready','failed'], default:'pending' },
  zone: { type: String, required },              // campus zone name
  location: { type:'Point', coordinates:[lng,lat] },  // optional 2dsphere
  dateEvent: Date (req),                         // when lost / found
  color: String,
  brand: String,
  status: { enum: ['open','matched','claimed','closed','expired'], default:'open', index },
  reporter: { ObjectId ref User, required, index },
  // found-only
  heldAtDesk: { type: Boolean, default:false },
  verificationQuestion: String,                  // never returned publicly
  verificationAnswerHash: { type:String, select:false }, // hash of normalized answer
  expiresAt: Date,
  timestamps
}
```
Indexes: `{ type:1, status:1, category:1 }`, `{ reporter:1, createdAt:-1 }`, `{ expiresAt:1 }`, text index on `title description`, optional `2dsphere` on `location`.

## Match
```js
{
  lostItem: ObjectId ref Item (req),
  foundItem: ObjectId ref Item (req),
  score: Number (0-1),
  confidence: { enum: ['high','medium','low'] },
  breakdown: { image: Number, text: Number, location: Number, time: Number },
  status: { enum: ['suggested','dismissed','claimed','confirmed'], default:'suggested' },
  timestamps
}
```
Unique index: `{ lostItem:1, foundItem:1 }`.

## Claim
```js
{
  match: ObjectId ref Match,
  lostItem: ObjectId, foundItem: ObjectId,
  claimant: ObjectId ref User,
  answer: String,                 // claimant's answer to verification question
  answerCorrect: Boolean,         // computed by server
  proofNote: String,
  status: { enum: ['pending','approved','rejected','cancelled'], default:'pending' },
  handledBy: ObjectId ref User,
  handledAt: Date,
  rejectReason: String,
  timestamps
}
```

## Notification
```js
{ user: ObjectId, type: { enum:['match','claim_update','claim_received','expiry'] },
  message: String, link: String, read: { type:Boolean, default:false }, timestamps }
```
Index `{ user:1, read:1, createdAt:-1 }`.

## HandoverLog
```js
{ foundItem: ObjectId, claim: ObjectId, givenTo: ObjectId, handledBy: ObjectId,
  idChecked: Boolean, note: String, handedAt: Date }
```

## Atlas Vector Search index (collection `items`, index name `item_embedding_index`)
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 512, "similarity": "cosine" },
    { "type": "filter", "path": "type" },
    { "type": "filter", "path": "category" },
    { "type": "filter", "path": "status" }
  ]
}
```
Create via Atlas UI -> Search -> Create Search Index -> JSON editor.
