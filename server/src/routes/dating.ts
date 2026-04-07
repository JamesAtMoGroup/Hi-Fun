import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  upsertDatingProfileSchema,
  updateDatingFiltersSchema,
  discoverPeopleSchema,
} from '../validators/dating.validator';
import {
  getDatingProfile,
  upsertDatingProfile,
  getDatingFilters,
  updateDatingFilters,
  discoverPeople,
} from '../controllers/dating.controller';

const router = Router();

// GET /users/me/dating-profile — get own dating profile
router.get('/users/me/dating-profile', requireAuth, getDatingProfile);

// PUT /users/me/dating-profile — create/update dating profile
router.put('/users/me/dating-profile', requireAuth, validate(upsertDatingProfileSchema), upsertDatingProfile);

// GET /users/me/dating-filters — get own dating filters
router.get('/users/me/dating-filters', requireAuth, getDatingFilters);

// PUT /users/me/dating-filters — update dating filters
router.put('/users/me/dating-filters', requireAuth, validate(updateDatingFiltersSchema), updateDatingFilters);

// GET /discover/people — browse people matching filters
router.get('/discover/people', requireAuth, validateQuery(discoverPeopleSchema), discoverPeople);

export default router;
