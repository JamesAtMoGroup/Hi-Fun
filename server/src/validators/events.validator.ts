import { z } from 'zod';

const eventCategories = [
  'nightclub', 'live_music', 'market', 'sports', 'exhibition',
  'food_drink', 'outdoor', 'workshop', 'party', 'other',
] as const;

const sortOptions = ['date', 'distance', 'popularity', 'price'] as const;
const dateRanges = ['today', 'this_week', 'this_weekend', 'this_month', 'custom'] as const;
const interactionTypes = ['attending', 'interested', 'want_to_go'] as const;

// Helper to coerce string "true"/"false" to boolean
const coerceBoolean = z.preprocess((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}, z.boolean().optional());

// Helper to coerce string to number
const coerceNumber = z.preprocess((val) => {
  if (typeof val === 'string' && val !== '') return Number(val);
  return val;
}, z.number().optional());

const coerceNumberRequired = z.preprocess((val) => {
  if (typeof val === 'string' && val !== '') return Number(val);
  return val;
}, z.number());

export const listEventsSchema = z.object({
  query: z.object({
    categories: z.string().optional().transform((val) => {
      if (!val) return undefined;
      const cats = val.split(',').map((c) => c.trim());
      // Validate each category
      for (const cat of cats) {
        if (!eventCategories.includes(cat as any)) {
          throw new Error(`Invalid category: ${cat}`);
        }
      }
      return cats as unknown as (typeof eventCategories[number])[];
    }),
    dateRange: z.enum(dateRanges).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    maxDistance: coerceNumber.pipe(z.number().positive().max(100).optional()),
    latitude: coerceNumber.pipe(z.number().min(-90).max(90).optional()),
    longitude: coerceNumber.pipe(z.number().min(-180).max(180).optional()),
    isFree: coerceBoolean,
    search: z.string().max(200).optional(),
    sortBy: z.enum(sortOptions).optional(),
    page: coerceNumber.pipe(z.number().int().positive().optional()).default(1),
    pageSize: coerceNumber.pipe(z.number().int().positive().max(100).optional()).default(20),
  }).refine((data) => {
    if (data.dateRange === 'custom' && (!data.startDate || !data.endDate)) {
      return false;
    }
    return true;
  }, { message: 'startDate and endDate are required when dateRange is custom' })
    .refine((data) => {
      if ((data.maxDistance || data.sortBy === 'distance') && (!data.latitude || !data.longitude)) {
        return false;
      }
      return true;
    }, { message: 'latitude and longitude are required when using maxDistance or sortBy=distance' }),
});

export const trendingEventsSchema = z.object({
  query: z.object({
    limit: coerceNumber.pipe(z.number().int().positive().max(50).optional()).default(10),
    latitude: coerceNumber.pipe(z.number().min(-90).max(90).optional()),
    longitude: coerceNumber.pipe(z.number().min(-180).max(180).optional()),
  }),
});

export const nearbyEventsSchema = z.object({
  query: z.object({
    latitude: coerceNumberRequired.pipe(z.number().min(-90).max(90)),
    longitude: coerceNumberRequired.pipe(z.number().min(-180).max(180)),
    radius: coerceNumber.pipe(z.number().positive().max(50).optional()).default(5),
    page: coerceNumber.pipe(z.number().int().positive().optional()).default(1),
    pageSize: coerceNumber.pipe(z.number().int().positive().max(100).optional()).default(20),
  }),
});

export const mapMarkersSchema = z.object({
  query: z.object({
    northEastLat: coerceNumberRequired.pipe(z.number().min(-90).max(90)),
    northEastLng: coerceNumberRequired.pipe(z.number().min(-180).max(180)),
    southWestLat: coerceNumberRequired.pipe(z.number().min(-90).max(90)),
    southWestLng: coerceNumberRequired.pipe(z.number().min(-180).max(180)),
    categories: z.string().optional().transform((val) => {
      if (!val) return undefined;
      const cats = val.split(',').map((c) => c.trim());
      for (const cat of cats) {
        if (!eventCategories.includes(cat as any)) {
          throw new Error(`Invalid category: ${cat}`);
        }
      }
      return cats as unknown as (typeof eventCategories[number])[];
    }),
  }),
});

export const setInteractionSchema = z.object({
  body: z.object({
    type: z.enum(interactionTypes),
  }),
});

export const friendsGoingSchema = z.object({
  query: z.object({
    page: coerceNumber.pipe(z.number().int().positive().optional()).default(1),
    pageSize: coerceNumber.pipe(z.number().int().positive().max(100).optional()).default(20),
  }),
});
