import { Router } from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import matchRoutes from './match.routes.js';
import claimRoutes from './claim.routes.js';

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

export default router;
