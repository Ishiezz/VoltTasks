import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { SignupInput, LoginInput } from '../schemas/auth.schema';

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.signup(req.body as SignupInput);
      sendSuccess(res, { user: { id: user.id, email: user.email } }, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await authService.login(req.body as LoginInput);
      sendSuccess(res, session);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await authService.logout(authReq.accessToken);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    sendSuccess(res, {
      id: authReq.userId,
      email: authReq.userEmail,
    });
  },
};
