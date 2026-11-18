import { Match } from '../models/Match.js';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';

export const dismissMatch = async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate('lostItem', 'reporter')
    .populate('foundItem', 'reporter');

  if (!match) {
    throw ApiError.notFound('Match suggestion not found');
  }

  const lostReporter = match.lostItem?.reporter?.toString();
  const foundReporter = match.foundItem?.reporter?.toString();
  const userId = req.user._id.toString();

  if (lostReporter !== userId && foundReporter !== userId && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only dismiss matches for your own items');
  }

  match.status = 'dismissed';
  await match.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Match suggestion dismissed'
    }
  });
};

export const getMyMatches = async (req, res) => {
  // Find all items reported by caller
  const myItems = await Item.find({ reporter: req.user._id }).select('_id');
  const myItemIds = myItems.map((i) => i._id);

  const matches = await Match.find({
    $or: [{ lostItem: { $in: myItemIds } }, { foundItem: { $in: myItemIds } }],
    status: 'suggested'
  })
    .populate({
      path: 'lostItem',
      select: 'title description category zone dateEvent images reporter status'
    })
    .populate({
      path: 'foundItem',
      select: 'title description category zone dateEvent images heldAtDesk reporter status'
    })
    .sort({ score: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      matches
    }
  });
};
