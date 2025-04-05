import { cache } from '@config/cache';
import { logInfo } from '@utils/logger';
import { Router } from 'express';

const router = Router();

router.get('/clear', (req, res) => {
  logInfo({ message: 'Clearing cache' });
  cache().clearAll();
  res.send('Cache cleared');
});

export default router;
