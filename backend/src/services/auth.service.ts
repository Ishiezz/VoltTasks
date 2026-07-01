import { supabaseAdmin } from '../utils/supabase';
import { SignupInput, LoginInput } from '../schemas/auth.schema';
import { logger } from '../utils/logger';

export const authService = {
  async signup(input: SignupInput) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // Auto-confirm for demo purposes
      user_metadata: input.fullName ? { full_name: input.fullName } : {},
    });

    if (error) {
      logger.warn({ error: error.message }, 'Signup failed');
      if (error.message.includes('already registered')) {
        throw Object.assign(new Error('Email already registered'), {
          statusCode: 409,
          code: 'EMAIL_EXISTS',
        });
      }
      throw Object.assign(new Error(error.message), {
        statusCode: 400,
        code: 'SIGNUP_FAILED',
      });
    }

    return data.user;
  },

  async login(input: LoginInput) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.session) {
      logger.warn({ email: input.email }, 'Login failed');
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    return {
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    };
  },

  async logout(accessToken: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
    if (error) {
      logger.warn({ error: error.message }, 'Logout warning');
    }
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return null;

    return data.users.find((u) => u.email === email) ?? null;
  },
};
