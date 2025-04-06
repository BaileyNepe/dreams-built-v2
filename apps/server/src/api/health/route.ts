import { Router } from 'express';

const router = Router();

router.get('/', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.VERSION || 'unknown'
  })
);

export default router;
