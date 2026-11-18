import { Notification } from '../models/Notification.js';
import { emitNotificationNew } from '../sockets/index.js';

export const createNotification = async ({ userId, type, message, link = '' }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      link,
      read: false
    });

    // Emit live socket event
    emitNotificationNew(userId, notification);

    return notification;
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
  }
};

export const getUserNotifications = async (userId, limit = 20) => {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const markNotificationRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
};
