import cron from 'node-cron';
import { Item } from '../models/Item.js';
import { createNotification } from '../services/notification.service.js';

/**
 * Nightly cron job to expire items that have passed their expiration window (default 60 days)
 * Runs every night at 00:00:00
 */
export const startExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running nightly item expiry check...');
      const now = new Date();

      const expiredItems = await Item.find({
        status: 'open',
        expiresAt: { $lte: now }
      });

      if (expiredItems.length === 0) {
        console.log('[Cron] No expired items to process.');
        return;
      }

      console.log(`[Cron] Found ${expiredItems.length} items to expire.`);

      for (const item of expiredItems) {
        item.status = 'expired';
        await item.save();

        await createNotification({
          userId: item.reporter,
          type: 'expiry',
          message: `Your report for "${item.title}" has reached its expiration window and is now archived.`,
          link: `/items/${item._id}`
        });
      }

      console.log(`[Cron] Successfully processed ${expiredItems.length} expired items.`);
    } catch (err) {
      console.error('[Cron] Error during item expiry job:', err.message);
    }
  });

  console.log('[Cron] Item expiry job scheduled (running nightly at 00:00).');
};
