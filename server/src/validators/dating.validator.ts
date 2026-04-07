import { z } from 'zod';

const genderValues = ['male', 'female', 'non_binary', 'other'] as const;
const datingRoleValues = ['top', 'bottom', 'vers', 'vers_top', 'vers_bottom', 'side', 'other'] as const;

export const upsertDatingProfileSchema = z.object({
  gender: z.enum(genderValues),
  role: z.enum(datingRoleValues),
  interestedInGenders: z.array(z.enum(genderValues)).min(1),
  interestedInRoles: z.array(z.enum(datingRoleValues)).min(1),
  bio: z.string().max(500).default(''),
  photos: z.array(z.string().url()).max(6).default([]),
  showOnDating: z.boolean().default(false),
  age: z.number().int().min(18).max(120),
}).refine(
  (data) => !data.showOnDating || data.photos.length >= 1,
  { message: 'At least 1 photo is required when showOnDating is true', path: ['photos'] },
);

export const updateDatingFiltersSchema = z.object({
  genders: z.array(z.enum(genderValues)).default([]),
  roles: z.array(z.enum(datingRoleValues)).default([]),
  ageRange: z.object({
    min: z.number().int().min(18).default(18),
    max: z.number().int().max(120).default(99),
  }).refine((r) => r.min <= r.max, { message: 'min must be <= max' }).default({ min: 18, max: 99 }),
  maxDistance: z.number().positive().max(500).default(50),
});

export const discoverPeopleSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  eventId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
