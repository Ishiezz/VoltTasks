import api from './api';
import { AuthSession } from '../types';

export const authService = {
  async signup(email: string, password: string): Promise<void> {
    await api.post('/auth/signup', { email, password });
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data as AuthSession;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<{ id: string; email: string }> {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
