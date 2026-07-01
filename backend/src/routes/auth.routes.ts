import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);

// POST /api/auth/login
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

export default router;
