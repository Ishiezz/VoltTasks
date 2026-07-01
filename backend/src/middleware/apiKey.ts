import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

export const apiKeyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey =
    req.headers['x-api-key'] ?? req.query['api_key'];

  if (!apiKey || apiKey !== env.N8N_API_KEY) {
    sendError(res, 401, 'INVALID_API_KEY', 'Valid API key required');
    return;
  }

  next();
};
