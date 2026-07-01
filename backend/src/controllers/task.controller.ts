import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  EmailTaskInput,
  SummaryQuery,
} from '../schemas/task.schema';

export const taskController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const query = req.query as unknown as TaskQuery;
      const { tasks, total } = await taskService.listTasks(authReq.userId, query);
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 20);
      sendSuccess(res, tasks, 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const task = await taskService.getTaskById(String(req.params.id), authReq.userId);
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const task = await taskService.createTask(authReq.userId, req.body as CreateTaskInput);
      sendSuccess(res, task, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const task = await taskService.updateTask(
        String(req.params.id),
        authReq.userId,
        req.body as UpdateTaskInput
      );
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await taskService.deleteTask(String(req.params.id), authReq.userId);
      sendSuccess(res, { message: 'Task deleted' });
    } catch (err) {
      next(err);
    }
  },

  async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const task = await taskService.toggleTask(String(req.params.id), authReq.userId);
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  // n8n: create task from parsed email
  async createFromEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTaskFromEmail(req.body as EmailTaskInput);
      sendSuccess(res, task, 201);
    } catch (err) {
      next(err);
    }
  },

  // n8n: get summary stats for reminders/digest
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SummaryQuery;
      const summary = await taskService.getTaskSummary(query);
      sendSuccess(res, summary);
    } catch (err) {
      next(err);
    }
  },
};
