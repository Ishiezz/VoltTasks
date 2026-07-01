import api from './api';
import { Task, CreateTaskPayload, UpdateTaskPayload, ApiResponse } from '../types';

export const taskService = {
  async list(params?: {
    status?: 'pending' | 'completed' | 'all';
    priority?: 'low' | 'medium' | 'high';
    due?: 'today' | 'week' | 'overdue';
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    const { data } = await api.get('/tasks', { params });
    const res = data as ApiResponse<Task[]>;
    return { tasks: res.data, total: res.meta?.total ?? res.data.length };
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get(`/tasks/${id}`);
    return (data as ApiResponse<Task>).data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post('/tasks', payload);
    return (data as ApiResponse<Task>).data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return (data as ApiResponse<Task>).data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggle(id: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/toggle`);
    return (data as ApiResponse<Task>).data;
  },
};
