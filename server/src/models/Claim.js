import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
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
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answer: {
      type: String,
      trim: true
    },
    answerCorrect: {
      type: Boolean,
      default: false
    },
    proofNote: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    handledAt: {
      type: Date
    },
    rejectReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

claimSchema.index({ claimant: 1, foundItem: 1 });
claimSchema.index({ foundItem: 1, status: 1 });

export const Claim = mongoose.model('Claim', claimSchema);
