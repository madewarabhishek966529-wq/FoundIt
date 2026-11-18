import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../services/notification.service.js';

export const list = async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      notifications
    }
  });
};

export const markRead = async (req, res) => {
  const notification = await markNotificationRead(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    data: {
      notification
    }
  });
};

export const markAllRead = async (req, res) => {
  const result = await markAllNotificationsRead(req.user._id);
  res.status(200).json({
    success: true,
    data: result
  });
};
