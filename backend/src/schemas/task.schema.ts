import { z } from 'zod';

const priorityEnum = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z.string().max(2000).trim().optional(),
  priority: priorityEnum.default('medium'),
  due_date: z
    .string()
    .datetime({ message: 'Invalid date format — use ISO 8601' })
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().nullable().optional(),
  priority: priorityEnum.optional(),
  due_date: z.string().datetime().nullable().optional(),
  is_completed: z.boolean().optional(),
});

export const taskQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'all']).default('all'),
  priority: priorityEnum.optional(),
  due: z.enum(['today', 'week', 'overdue']).optional(),
  sort: z.enum(['created_at', 'due_date', 'priority', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
});

export const emailTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  priority: priorityEnum.default('medium'),
  due_date: z.string().datetime().optional(),
  sender_email: z.string().email(),
});

export const summaryQuerySchema = z.object({
  filter: z.enum(['due_today', 'due_week', 'overdue', 'all']).default('all'),
  period: z.enum(['last_week', 'today', 'month']).default('last_week'),
  user_email: z.string().email().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type EmailTaskInput = z.infer<typeof emailTaskSchema>;
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
