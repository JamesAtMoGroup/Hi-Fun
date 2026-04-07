import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, getMyEventsSchema } from '../validators/users.validator';
import {
  getMyProfile,
  updateProfile,
  getUserProfile,
  getMyEvents,
} from '../controllers/users.controller';

const router = Router();

// GET /users/me — get my profile
router.get('/users/me', requireAuth, getMyProfile);

// PATCH /users/me — update profile
router.patch('/users/me', requireAuth, validate(updateProfileSchema), updateProfile);

// GET /users/me/events — my events by interaction type
router.get('/users/me/events', requireAuth, validate(getMyEventsSchema), getMyEvents);

// GET /users/:userId — get public profile (must be after /users/me routes)
router.get('/users/:userId', requireAuth, getUserProfile);

export default router;
