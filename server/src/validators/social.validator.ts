import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const listPendingRequestsSchema = z.object({
  direction: z.enum(['incoming', 'outgoing']).default('incoming'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const listFriendsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const friendActivitySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
