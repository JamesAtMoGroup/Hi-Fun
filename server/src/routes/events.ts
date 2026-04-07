import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listEventsSchema,
  trendingEventsSchema,
  nearbyEventsSchema,
  mapMarkersSchema,
  setInteractionSchema,
  friendsGoingSchema,
} from '../validators/events.validator';
import {
  listEvents,
  getTrending,
  getNearby,
  getMapMarkers,
  getEventDetail,
  getFriendsGoing,
  setInteraction,
  removeInteraction,
} from '../controllers/events.controller';

const router = Router();

// GET /events — list events with filters (optionalAuth for friendsGoing data)
router.get('/events', optionalAuth, validate(listEventsSchema), listEvents);

// GET /events/trending — trending events
router.get('/events/trending', optionalAuth, validate(trendingEventsSchema), getTrending);

// GET /events/nearby — nearby events sorted by distance
router.get('/events/nearby', optionalAuth, validate(nearbyEventsSchema), getNearby);

// GET /events/map-markers — map markers within bounding box
router.get('/events/map-markers', optionalAuth, validate(mapMarkersSchema), getMapMarkers);

// GET /events/:eventId — event detail
router.get('/events/:eventId', optionalAuth, getEventDetail);

// GET /events/:eventId/friends-going — paginated friends going to event
router.get('/events/:eventId/friends-going', requireAuth, validate(friendsGoingSchema), getFriendsGoing);

// POST /events/:eventId/interactions — set interaction (attending/interested/want_to_go)
router.post('/events/:eventId/interactions', requireAuth, validate(setInteractionSchema), setInteraction);

// DELETE /events/:eventId/interactions — remove interaction
router.delete('/events/:eventId/interactions', requireAuth, removeInteraction);

export default router;
