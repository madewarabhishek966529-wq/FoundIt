# Atlas Vector Search Index Configuration

To enable vector search on MongoDB Atlas for FoundIt:

1. Log in to **MongoDB Atlas**.
2. Go to your cluster -> **Atlas Search** (or **Search** in the sidebar).
3. Click **Create Search Index**.
4. Select **JSON Editor** under **Atlas Vector Search**.
5. Select your database (e.g. `foundit`) and collection (`items`).
6. Name the index: `item_embedding_index`.
7. Paste the following JSON definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 512,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "type"
    },
    {
      "type": "filter",
      "path": "category"
    },
    {
      "type": "filter",
      "path": "status"
    }
  ]
}
```
8. Click **Next** and **Create Search Index**.
9. The index status will show *Building* and change to *Active* within ~1-2 minutes.
