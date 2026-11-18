import mongoose from 'mongoose';

export const CATEGORIES = [
  'phone',
  'laptop',
  'earbuds',
  'wallet',
  'id-card',
  'keys',
  'bottle',
  'bag',
  'book',
  'clothing',
  'watch',
  'glasses',
  'other'
];

export const CAMPUS_ZONES = [
  'Main Gate',
  'Library',
  'Canteen',
  'Admin Block',
  'CS Dept',
  'Mech Dept',
  'Ground',
  'Hostel A',
  'Hostel B',
  'Parking',
  'Auditorium'
];

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
      index: true
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' }
      }
    ],
    embedding: {
      type: [Number],
      select: false
    },
    imageEmbedding: {
      type: [Number],
      select: false
    },
    textEmbedding: {
      type: [Number],
      select: false
    },
    embeddingStatus: {
      type: String,
      enum: ['pending', 'ready', 'failed'],
      default: 'pending'
    },
    zone: {
      type: String,
      required: [true, 'Campus zone is required']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    },
    dateEvent: {
      type: Date,
      required: [true, 'Event date is required']
    },
    color: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'claimed', 'closed', 'expired'],
      default: 'open',
      index: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Found-only fields
    heldAtDesk: {
      type: Boolean,
      default: false
    },
    verificationQuestion: {
      type: String,
      trim: true
    },
    verificationAnswerHash: {
      type: String,
      select: false
    },
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ reporter: 1, createdAt: -1 });
itemSchema.index({ expiresAt: 1 });
itemSchema.index({ title: 'text', description: 'text' });

export const Item = mongoose.model('Item', itemSchema);
