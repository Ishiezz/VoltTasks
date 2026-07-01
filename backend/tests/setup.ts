process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key-minimum-16chars!';
process.env.SUPABASE_JWT_SECRET = 'test-jwt-secret-minimum-16chars!';
process.env.N8N_API_KEY = 'test-n8n-api-key-12345678';
process.env.LOG_LEVEL = 'silent';
process.env.RATE_LIMIT_MAX = '1000';
process.env.CORS_ORIGIN = '*';
process.env.RATE_LIMIT_WINDOW_MS = '60000';

jest.mock('../src/utils/supabase', () => {
  const mockFrom = {
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
  };

  const mockSupabase = {
    from: jest.fn().mockReturnValue(mockFrom),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockImplementation(({ email, password }: any) => {
        if (email === 'notexist@example.com' || password === 'wrongpassword') {
          return Promise.resolve({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
          });
        }
        return Promise.resolve({
          data: {
            user: { id: 'test-user-id', email: email || 'test@example.com' },
            session: { access_token: 'token', refresh_token: 'refresh' },
          },
          error: null,
        });
      }),
      getUser: jest.fn().mockImplementation((token: string) => {
        if (token === 'valid-token') {
          return Promise.resolve({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
      }),
      admin: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  };

  return {
    supabaseAdmin: mockSupabase,
    supabaseUser: jest.fn().mockReturnValue(mockSupabase),
  };
});
