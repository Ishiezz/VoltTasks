import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { apiKeyAuth } from '../middleware/apiKey';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  emailTaskSchema,
  summaryQuerySchema,
} from '../schemas/task.schema';

const router = Router();

// ── User-authenticated routes (JWT) ──────────────────────────────────

// GET /api/tasks
router.get('/', authenticate, validate(taskQuerySchema, 'query'), taskController.list);

// POST /api/tasks
router.post('/', authenticate, validate(createTaskSchema), taskController.create);

// GET /api/tasks/:id
router.get('/:id', authenticate, taskController.getOne);

// PATCH /api/tasks/:id
router.patch('/:id', authenticate, validate(updateTaskSchema), taskController.update);

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, taskController.remove);

// POST /api/tasks/:id/toggle
router.post('/:id/toggle', authenticate, taskController.toggle);

// ── API-key routes (n8n automation) ──────────────────────────────────

// POST /api/tasks/from-email  — n8n creates task from parsed email
router.post('/from-email', apiKeyAuth, validate(emailTaskSchema), taskController.createFromEmail);

// GET /api/tasks/summary  — n8n fetches stats for reminders + digest
router.get('/summary', apiKeyAuth, validate(summaryQuerySchema, 'query'), taskController.getSummary);

export default router;
