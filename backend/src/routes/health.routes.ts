import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  try {
    await supabaseAdmin.from('tasks').select('id').limit(1);
  } catch {
    dbStatus = 'error';
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    service: 'task-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    checks: { database: dbStatus },
  });
});

export default router;
