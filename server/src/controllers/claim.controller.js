import {
  submitClaim,
  getMyClaims,
  getIncomingClaims,
  approveClaim,
  rejectClaim,
  cancelClaim
} from '../services/claim.service.js';

export const create = async (req, res) => {
  const claim = await submitClaim(req.body, req.user._id);
  res.status(201).json({
    success: true,
    data: {
      claim
    }
  });
};

export const getMine = async (req, res) => {
  const claims = await getMyClaims(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      claims
    }
  });
};

export const getIncoming = async (req, res) => {
  const claims = await getIncomingClaims(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      claims
    }
  });
};

export const approve = async (req, res) => {
  const claim = await approveClaim(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: {
      claim,
      message: 'Claim approved successfully'
    }
  });
};

export const reject = async (req, res) => {
  const claim = await rejectClaim(req.params.id, req.body.reason, req.user);
  res.status(200).json({
    success: true,
    data: {
      claim,
      message: 'Claim rejected'
    }
  });
};

export const cancel = async (req, res) => {
  const claim = await cancelClaim(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    data: {
      claim,
      message: 'Claim cancelled'
    }
  });
};
