import { Response } from 'express';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    error: Object.assign(
      { code, message },
      details !== undefined ? { details } : {}
    ),
    timestamp: new Date().toISOString(),
  });
};
