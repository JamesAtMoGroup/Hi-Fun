import { z } from 'zod';

const coerceNumber = z.preprocess((val) => {
  if (typeof val === 'string' && val !== '') return Number(val);
  return val;
}, z.number().optional());

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(300).optional(),
  }),
});

export const getMyEventsSchema = z.object({
  query: z.object({
    type: z.enum(['attending', 'interested', 'want_to_go']),
    page: coerceNumber.pipe(z.number().int().positive().optional()).default(1),
    pageSize: coerceNumber.pipe(z.number().int().positive().max(100).optional()).default(20),
  }),
});
