import { supabaseAdmin } from '../utils/supabase';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  EmailTaskInput,
  SummaryQuery,
} from '../schemas/task.schema';
import { logger } from '../utils/logger';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  source: 'mobile' | 'email' | 'api';
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const taskService = {
  async listTasks(
    userId: string,
    query: TaskQuery
  ): Promise<{ tasks: Task[]; total: number }> {
    let dbQuery = supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);

    // Status filter
    if (query.status === 'pending') dbQuery = dbQuery.eq('is_completed', false);
    if (query.status === 'completed') dbQuery = dbQuery.eq('is_completed', true);

    // Priority filter
    if (query.priority) dbQuery = dbQuery.eq('priority', query.priority);

    // Due date filter
    if (query.due === 'today') {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      dbQuery = dbQuery.gte('due_date', start).lte('due_date', end);
    } else if (query.due === 'week') {
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      dbQuery = dbQuery.gte('due_date', now.toISOString()).lte('due_date', weekEnd.toISOString());
    } else if (query.due === 'overdue') {
      dbQuery = dbQuery.lt('due_date', new Date().toISOString()).eq('is_completed', false);
    }

    // Sorting
    dbQuery = dbQuery.order(query.sort, { ascending: query.order === 'asc' });

    // Pagination
    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(offset, offset + query.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      logger.error({ error, userId }, 'Failed to list tasks');
      throw Object.assign(new Error('Failed to fetch tasks'), {
        statusCode: 500,
        code: 'DB_ERROR',
      });
    }

    return { tasks: (data as Task[]) ?? [], total: count ?? 0 };
  },

  async getTaskById(id: string, userId: string): Promise<Task> {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw Object.assign(new Error('Task not found'), {
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
      });
    }

    return data as Task;
  },

  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        due_date: input.due_date ?? null,
        source: 'mobile',
      })
      .select()
      .single();

    if (error || !data) {
      logger.error({ error, userId }, 'Failed to create task');
      throw Object.assign(new Error('Failed to create task'), {
        statusCode: 500,
        code: 'CREATE_FAILED',
      });
    }

    return data as Task;
  },

  async updateTask(id: string, userId: string, input: UpdateTaskInput): Promise<Task> {
    // Verify ownership
    await taskService.getTaskById(id, userId);

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.due_date !== undefined) updateData.due_date = input.due_date;
    if (input.is_completed !== undefined) updateData.is_completed = input.is_completed;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw Object.assign(new Error('Failed to update task'), {
        statusCode: 500,
        code: 'UPDATE_FAILED',
      });
    }

    return data as Task;
  },

  async deleteTask(id: string, userId: string): Promise<void> {
    await taskService.getTaskById(id, userId);

    const { error } = await supabaseAdmin
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw Object.assign(new Error('Failed to delete task'), {
        statusCode: 500,
        code: 'DELETE_FAILED',
      });
    }
  },

  async toggleTask(id: string, userId: string): Promise<Task> {
    const task = await taskService.getTaskById(id, userId);

    return taskService.updateTask(id, userId, {
      is_completed: !task.is_completed,
    });
  },

  async createTaskFromEmail(input: EmailTaskInput): Promise<Task> {
    // Look up user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      throw Object.assign(new Error('Failed to lookup user'), {
        statusCode: 500,
        code: 'USER_LOOKUP_FAILED',
      });
    }

    const user = users.users.find((u) => u.email === input.sender_email);

    if (!user) {
      throw Object.assign(new Error(`No user found for email: ${input.sender_email}`), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        due_date: input.due_date ?? null,
        source: 'email',
      })
      .select()
      .single();

    if (error || !data) {
      throw Object.assign(new Error('Failed to create task from email'), {
        statusCode: 500,
        code: 'CREATE_FAILED',
      });
    }

    logger.info({ taskId: data.id, senderEmail: input.sender_email }, 'Task created from email');
    return data as Task;
  },

  async getTaskSummary(query: SummaryQuery) {
    // Get all users or specific user
    let usersToProcess: { id: string; email: string }[] = [];

    if (query.user_email) {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const user = data?.users.find((u) => u.email === query.user_email);
      if (user) usersToProcess = [{ id: user.id, email: user.email ?? '' }];
    } else {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      usersToProcess = (data?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email ?? '',
      }));
    }

    const summaries = await Promise.all(
      usersToProcess.map(async (user) => {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch tasks for this user
        const { data: tasks } = await supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null);

        if (!tasks) return null;

        const dueTodayTasks = tasks.filter(
          (t) =>
            !t.is_completed &&
            t.due_date &&
            new Date(t.due_date) >= todayStart &&
            new Date(t.due_date) <= todayEnd
        );

        const overdueTasks = tasks.filter(
          (t) => !t.is_completed && t.due_date && new Date(t.due_date) < todayStart
        );

        const completedThisWeek = tasks.filter(
          (t) => t.is_completed && new Date(t.updated_at) >= weekAgo
        );

        const createdThisWeek = tasks.filter(
          (t) => new Date(t.created_at) >= weekAgo
        );

        return {
          user_email: user.email,
          total_tasks: tasks.length,
          completed_tasks: tasks.filter((t) => t.is_completed).length,
          pending_tasks: tasks.filter((t) => !t.is_completed).length,
          overdue_tasks: overdueTasks.length,
          created_this_week: createdThisWeek.length,
          completed_this_week: completedThisWeek.length,
          due_today: dueTodayTasks.length,
          due_today_tasks: dueTodayTasks,
          overdue_task_list: overdueTasks,
          completion_rate:
            tasks.length > 0
              ? Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100)
              : 0,
        };
      })
    );

    return summaries.filter(Boolean);
  },
};
