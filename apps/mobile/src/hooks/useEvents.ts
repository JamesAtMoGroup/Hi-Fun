import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { EventSummary, EventFilters, PaginatedResponse, ApiResponse } from '@fomo/shared/src/types';

// ─── Mock Data ──────────────────────────────────────────────

const MOCK_FRIENDS = [
  { userId: 'f1', displayName: 'Alice', avatarUrl: 'https://i.pravatar.cc/100?u=alice', status: 'attending' as const },
  { userId: 'f2', displayName: 'Bob', avatarUrl: 'https://i.pravatar.cc/100?u=bob', status: 'interested' as const },
  { userId: 'f3', displayName: 'Carol', avatarUrl: 'https://i.pravatar.cc/100?u=carol', status: 'attending' as const },
  { userId: 'f4', displayName: 'Dave', avatarUrl: 'https://i.pravatar.cc/100?u=dave', status: 'want_to_go' as const },
];

export const MOCK_EVENTS: EventSummary[] = [
  {
    id: '1',
    title: 'PAWN Taipei Friday Night',
    category: 'nightclub',
    venueName: 'PAWN Taipei',
    coverImageUrl: 'https://picsum.photos/seed/pawn/600/400',
    startTime: '2026-04-10T22:00:00+08:00',
    endTime: '2026-04-11T04:00:00+08:00',
    isFree: false,
    priceRange: { min: 500, max: 800, currency: 'TWD' },
    attendingCount: 230,
    interestedCount: 512,
    latitude: 25.0418,
    longitude: 121.5497,
    isPromoted: true,
    friendsGoing: MOCK_FRIENDS.slice(0, 3),
  },
  {
    id: '2',
    title: 'Taipei Night Market Tour',
    category: 'food_drink',
    venueName: 'Raohe Night Market',
    coverImageUrl: 'https://picsum.photos/seed/raohe/600/400',
    startTime: '2026-04-11T18:00:00+08:00',
    endTime: '2026-04-11T22:00:00+08:00',
    isFree: true,
    attendingCount: 88,
    interestedCount: 200,
    latitude: 25.0513,
    longitude: 121.5774,
    isPromoted: false,
    friendsGoing: MOCK_FRIENDS.slice(1, 4),
  },
  {
    id: '3',
    title: 'Indie Band Showcase @ Revolver',
    category: 'live_music',
    venueName: 'Revolver',
    coverImageUrl: 'https://picsum.photos/seed/revolver/600/400',
    startTime: '2026-04-12T20:00:00+08:00',
    endTime: '2026-04-12T23:30:00+08:00',
    isFree: false,
    priceRange: { min: 350, max: 350, currency: 'TWD' },
    attendingCount: 120,
    interestedCount: 340,
    latitude: 25.0330,
    longitude: 121.5293,
    isPromoted: false,
    friendsGoing: [],
  },
  {
    id: '4',
    title: 'Weekend Yoga in Daan Park',
    category: 'outdoor',
    venueName: 'Daan Forest Park',
    coverImageUrl: 'https://picsum.photos/seed/yoga/600/400',
    startTime: '2026-04-12T07:00:00+08:00',
    endTime: '2026-04-12T08:30:00+08:00',
    isFree: true,
    attendingCount: 45,
    interestedCount: 89,
    latitude: 25.0328,
    longitude: 121.5355,
    isPromoted: false,
    friendsGoing: MOCK_FRIENDS.slice(0, 2),
  },
  {
    id: '5',
    title: 'Taipei Creative Expo 2026',
    category: 'exhibition',
    venueName: 'Songshan Cultural Park',
    coverImageUrl: 'https://picsum.photos/seed/expo/600/400',
    startTime: '2026-04-14T10:00:00+08:00',
    endTime: '2026-04-14T18:00:00+08:00',
    isFree: false,
    priceRange: { min: 200, max: 400, currency: 'TWD' },
    attendingCount: 310,
    interestedCount: 870,
    latitude: 25.0442,
    longitude: 121.5600,
    isPromoted: true,
    friendsGoing: MOCK_FRIENDS,
  },
  {
    id: '6',
    title: 'Basketball Pickup Game',
    category: 'sports',
    venueName: 'Taipei Arena Courts',
    coverImageUrl: 'https://picsum.photos/seed/bball/600/400',
    startTime: '2026-04-13T14:00:00+08:00',
    endTime: '2026-04-13T17:00:00+08:00',
    isFree: true,
    attendingCount: 18,
    interestedCount: 32,
    latitude: 25.0511,
    longitude: 121.5498,
    isPromoted: false,
    friendsGoing: [],
  },
  {
    id: '7',
    title: 'Ceramics Workshop',
    category: 'workshop',
    venueName: 'Yingge Ceramics Studio',
    coverImageUrl: 'https://picsum.photos/seed/ceramics/600/400',
    startTime: '2026-04-15T13:00:00+08:00',
    endTime: '2026-04-15T16:00:00+08:00',
    isFree: false,
    priceRange: { min: 800, max: 1200, currency: 'TWD' },
    attendingCount: 12,
    interestedCount: 40,
    latitude: 24.9546,
    longitude: 121.3463,
    isPromoted: false,
    friendsGoing: MOCK_FRIENDS.slice(2, 4),
  },
  {
    id: '8',
    title: 'Treasure Hill Market',
    category: 'market',
    venueName: 'Treasure Hill Artist Village',
    coverImageUrl: 'https://picsum.photos/seed/market/600/400',
    startTime: '2026-04-12T11:00:00+08:00',
    endTime: '2026-04-12T18:00:00+08:00',
    isFree: true,
    attendingCount: 200,
    interestedCount: 450,
    latitude: 25.0108,
    longitude: 121.5322,
    isPromoted: false,
    friendsGoing: MOCK_FRIENDS.slice(0, 1),
  },
  {
    id: '9',
    title: 'Rooftop House Party',
    category: 'party',
    venueName: 'Private Venue, Xinyi',
    coverImageUrl: 'https://picsum.photos/seed/party/600/400',
    startTime: '2026-04-11T21:00:00+08:00',
    endTime: '2026-04-12T02:00:00+08:00',
    isFree: false,
    priceRange: { min: 300, max: 300, currency: 'TWD' },
    attendingCount: 65,
    interestedCount: 150,
    latitude: 25.0339,
    longitude: 121.5645,
    isPromoted: false,
    friendsGoing: MOCK_FRIENDS.slice(0, 4),
  },
  {
    id: '10',
    title: 'Taipei Film Festival Screening',
    category: 'other',
    venueName: 'Zhongshan Hall',
    coverImageUrl: 'https://picsum.photos/seed/film/600/400',
    startTime: '2026-04-16T19:00:00+08:00',
    endTime: '2026-04-16T22:00:00+08:00',
    isFree: false,
    priceRange: { min: 250, max: 450, currency: 'TWD' },
    attendingCount: 175,
    interestedCount: 520,
    latitude: 25.0425,
    longitude: 121.5080,
    isPromoted: true,
    friendsGoing: MOCK_FRIENDS.slice(1, 3),
  },
];

// ─── Hooks ──────────────────────────────────────────────────

export const useEvents = (filters: EventFilters) =>
  useQuery<EventSummary[]>({
    queryKey: ['events', filters],
    queryFn: async () => {
      // In production, call API:
      // const { data } = await api.get<ApiResponse<PaginatedResponse<EventSummary>>>('/events', { params: filters });
      // return data.data.items;

      // For now, filter mock data
      let results = [...MOCK_EVENTS];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.venueName.toLowerCase().includes(q),
        );
      }

      if (filters.categories && filters.categories.length > 0) {
        results = results.filter((e) => filters.categories!.includes(e.category));
      }

      if (filters.isFree !== undefined) {
        results = results.filter((e) => e.isFree === filters.isFree);
      }

      return results;
    },
  });

export const useTrendingEvents = () =>
  useQuery<EventSummary[]>({
    queryKey: ['events', 'trending'],
    queryFn: async () => {
      // const { data } = await api.get<ApiResponse<EventSummary[]>>('/events/trending', { params: { limit: 10 } });
      // return data.data;
      return MOCK_EVENTS.sort((a, b) => b.attendingCount - a.attendingCount).slice(0, 6);
    },
  });

export const useNearbyEvents = (lat: number, lng: number) =>
  useInfiniteQuery<PaginatedResponse<EventSummary>>({
    queryKey: ['events', 'nearby', lat, lng],
    queryFn: async ({ pageParam = 1 }) => {
      // const { data } = await api.get<ApiResponse<PaginatedResponse<EventSummary>>>('/events/nearby', {
      //   params: { lat, lng, radiusKm: 5, page: pageParam, pageSize: 20 },
      // });
      // return data.data;

      const pageSize = 5;
      const page = pageParam as number;
      const start = (page - 1) * pageSize;
      const items = MOCK_EVENTS.slice(start, start + pageSize);
      return {
        items,
        total: MOCK_EVENTS.length,
        page,
        pageSize,
        hasMore: start + pageSize < MOCK_EVENTS.length,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
