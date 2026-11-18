import {
  getPlatformStats,
  getDeskItems,
  getAdminClaimsQueue,
  completeHandover,
  getHandoverLogs
} from '../services/admin.service.js';

export const stats = async (req, res) => {
  const data = await getPlatformStats();
  res.status(200).json({
    success: true,
    data
  });
};

export const deskItems = async (req, res) => {
  const items = await getDeskItems();
  res.status(200).json({
    success: true,
    data: {
      items
    }
  });
};

export const claimsQueue = async (req, res) => {
  const claims = await getAdminClaimsQueue(req.query.status);
  res.status(200).json({
    success: true,
    data: {
      claims
    }
  });
};

export const handover = async (req, res) => {
  const log = await completeHandover(req.body, req.user);
  res.status(200).json({
    success: true,
    data: {
      log,
      message: 'Item handover logged and completed successfully'
    }
  });
};

export const handoverLog = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const result = await getHandoverLogs(page, limit);
  res.status(200).json({
    success: true,
    data: {
      logs: result.logs
    },
    meta: result.meta
  });
};
