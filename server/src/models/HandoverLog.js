import mongoose from 'mongoose';

const handoverLogSchema = new mongoose.Schema(
  {
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true
    },
    givenTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    idChecked: {
      type: Boolean,
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    handedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const HandoverLog = mongoose.model('HandoverLog', handoverLogSchema);
