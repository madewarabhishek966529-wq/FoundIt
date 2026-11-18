import { Router } from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import matchRoutes from './match.routes.js';
import claimRoutes from './claim.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'FoundIt API',
      timestamp: new Date().toISOString()
    }
  });
});

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/matches', matchRoutes);
router.use('/claims', claimRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
