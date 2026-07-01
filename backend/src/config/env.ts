import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });


const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(10),
  SUPABASE_JWT_SECRET: z.string().min(10),
  N8N_API_KEY: z.string().min(16),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'silent']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
