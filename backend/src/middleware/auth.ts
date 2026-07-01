import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
  accessToken: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
      return;
    }

    const token = authHeader.substring(7);

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      logger.warn({ error: error?.message }, 'JWT verification failed');
      sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
      return;
    }

    (req as AuthenticatedRequest).userId = data.user.id;
    (req as AuthenticatedRequest).userEmail = data.user.email ?? '';
    (req as AuthenticatedRequest).accessToken = token;

    next();
  } catch (err) {
    logger.error({ err }, 'Auth middleware error');
    sendError(res, 500, 'INTERNAL_ERROR', 'Authentication failed');
  }
};
