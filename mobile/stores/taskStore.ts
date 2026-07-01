import { create } from 'zustand';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { taskService } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  isRefreshing: boolean;
  total: number;
  fetchTasks: (params?: Parameters<typeof taskService.list>[0]) => Promise<void>;
  refreshTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  // Optimistic helpers
  optimisticToggle: (id: string) => void;
  revertToggle: (id: string, original: boolean) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  isRefreshing: false,
  total: 0,

  fetchTasks: async (params) => {
    set({ isLoading: true });
    try {
      const { tasks, total } = await taskService.list(params);
      set({ tasks, total });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTasks: async () => {
    set({ isRefreshing: true });
    try {
      const { tasks, total } = await taskService.list();
      set({ tasks, total });
    } finally {
      set({ isRefreshing: false });
    }
  },

  createTask: async (payload) => {
    const task = await taskService.create(payload);
    set((state) => ({ tasks: [task, ...state.tasks], total: state.total + 1 }));
    return task;
  },

  updateTask: async (id, payload) => {
    const updated = await taskService.update(id, payload);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    // Optimistic remove
    const prev = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      total: state.total - 1,
    }));
    try {
      await taskService.delete(id);
    } catch (err) {
      // Revert on failure
      set({ tasks: prev, total: prev.length });
      throw err;
    }
  },

  toggleTask: async (id) => {
    // Optimistic toggle
    get().optimisticToggle(id);
    try {
      const updated = await taskService.toggle(id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err) {
      const task = get().tasks.find((t) => t.id === id);
      if (task) get().revertToggle(id, task.is_completed);
      throw err;
    }
  },

  optimisticToggle: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      ),
    }));
  },

  revertToggle: (id, original) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, is_completed: original } : t
      ),
    }));
  },
}));
