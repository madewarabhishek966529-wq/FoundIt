import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true
    },
    breakdown: {
      image: { type: Number, default: 0 },
      text: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      time: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['suggested', 'dismissed', 'claimed', 'confirmed'],
      default: 'suggested'
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);
