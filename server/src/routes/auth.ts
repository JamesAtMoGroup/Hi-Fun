import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
import { register, login, refresh, me } from '../controllers/auth.controller';

const router = Router();

// POST /auth/register — register with email/password/displayName
router.post('/auth/register', validate(registerSchema), register);

// POST /auth/login — login with email/password
router.post('/auth/login', validate(loginSchema), login);

// POST /auth/refresh — refresh token
router.post('/auth/refresh', validate(refreshSchema), refresh);

// GET /auth/me — get current user
router.get('/auth/me', requireAuth, me);

export default router;
