import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  sendFriendRequestSchema,
  listPendingRequestsSchema,
  listFriendsSchema,
  friendActivitySchema,
} from '../validators/social.validator';
import {
  listFriends,
  sendFriendRequest,
  listPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  friendActivity,
} from '../controllers/social.controller';

const router = Router();

// GET /friends — list accepted friends
router.get('/friends', requireAuth, validateQuery(listFriendsSchema), listFriends);

// POST /friends/requests — send friend request
router.post('/friends/requests', requireAuth, validate(sendFriendRequestSchema), sendFriendRequest);

// GET /friends/requests — list pending requests (direction=incoming|outgoing)
router.get('/friends/requests', requireAuth, validateQuery(listPendingRequestsSchema), listPendingRequests);

// PUT /friends/requests/:requestId/accept — accept friend request
router.put('/friends/requests/:requestId/accept', requireAuth, acceptFriendRequest);

// PUT /friends/requests/:requestId/reject — reject friend request
router.put('/friends/requests/:requestId/reject', requireAuth, rejectFriendRequest);

// DELETE /friends/:userId — remove friend
router.delete('/friends/:userId', requireAuth, removeFriend);

// GET /friends/activity — friend activity feed
router.get('/friends/activity', requireAuth, validateQuery(friendActivitySchema), friendActivity);

export default router;
