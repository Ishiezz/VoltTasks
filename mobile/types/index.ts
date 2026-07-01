export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  source: 'mobile' | 'email' | 'api';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  is_completed?: boolean;
};

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  created_this_week: number;
  completed_this_week: number;
  due_today: number;
  completion_rate: number;
}
