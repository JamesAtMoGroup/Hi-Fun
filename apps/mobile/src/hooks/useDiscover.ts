import { useQuery } from '@tanstack/react-query';
import type { DiscoverPerson, FriendActivity, EventSummary } from '@fomo/shared/src/types';

// ─── Mock Data ──────────────────────────────────────────────

const MOCK_EVENTS: EventSummary[] = [
  {
    id: 'evt-1',
    title: 'Ximending Neon Night',
    category: 'nightclub',
    venueName: 'OMNI Nightclub',
    coverImageUrl: 'https://picsum.photos/seed/evt1/400/300',
    startTime: '2026-04-11T22:00:00+08:00',
    endTime: '2026-04-12T04:00:00+08:00',
    isFree: false,
    priceRange: { min: 500, max: 1500, currency: 'TWD' },
    attendingCount: 230,
    interestedCount: 540,
    latitude: 25.0424,
    longitude: 121.5081,
    isPromoted: true,
    friendsGoing: [],
  },
  {
    id: 'evt-2',
    title: 'Taipei 101 Rooftop Party',
    category: 'party',
    venueName: 'Taipei 101 Sky Lounge',
    coverImageUrl: 'https://picsum.photos/seed/evt2/400/300',
    startTime: '2026-04-12T20:00:00+08:00',
    endTime: '2026-04-12T23:59:00+08:00',
    isFree: false,
    priceRange: { min: 800, max: 2000, currency: 'TWD' },
    attendingCount: 150,
    interestedCount: 380,
    latitude: 25.0339,
    longitude: 121.5645,
    isPromoted: false,
    friendsGoing: [],
  },
  {
    id: 'evt-3',
    title: 'Dadaocheng Market Walk',
    category: 'market',
    venueName: 'Dihua Street',
    coverImageUrl: 'https://picsum.photos/seed/evt3/400/300',
    startTime: '2026-04-13T10:00:00+08:00',
    endTime: '2026-04-13T17:00:00+08:00',
    isFree: true,
    attendingCount: 85,
    interestedCount: 220,
    latitude: 25.0568,
    longitude: 121.5101,
    isPromoted: false,
    friendsGoing: [],
  },
  {
    id: 'evt-4',
    title: 'Songshan Creative Park Exhibition',
    category: 'exhibition',
    venueName: 'Songshan Cultural Park',
    coverImageUrl: 'https://picsum.photos/seed/evt4/400/300',
    startTime: '2026-04-14T11:00:00+08:00',
    endTime: '2026-04-14T20:00:00+08:00',
    isFree: false,
    priceRange: { min: 250, max: 250, currency: 'TWD' },
    attendingCount: 120,
    interestedCount: 310,
    latitude: 25.0442,
    longitude: 121.5607,
    isPromoted: false,
    friendsGoing: [],
  },
];

const MOCK_PEOPLE: DiscoverPerson[] = [
  {
    userId: 'u-1',
    displayName: 'Jason',
    age: 27,
    gender: 'male',
    role: 'vers',
    bio: 'Taipei foodie who lives near Yongkang Street. Love exploring night markets and rooftop bars.',
    photos: [
      'https://picsum.photos/seed/p1a/400/500',
      'https://picsum.photos/seed/p1b/400/500',
      'https://picsum.photos/seed/p1c/400/500',
    ],
    distance: 2.3,
    mutualFriendCount: 3,
    sharedEventCount: 2,
  },
  {
    userId: 'u-2',
    displayName: 'Kevin',
    age: 31,
    gender: 'male',
    role: 'top',
    bio: 'Gym rat in Xinyi District. Looking for event buddies to hit up Taipei nightlife.',
    photos: [
      'https://picsum.photos/seed/p2a/400/500',
      'https://picsum.photos/seed/p2b/400/500',
    ],
    distance: 1.1,
    mutualFriendCount: 1,
    sharedEventCount: 1,
  },
  {
    userId: 'u-3',
    displayName: 'Mia',
    age: 24,
    gender: 'female',
    role: 'bottom',
    bio: 'Art student at NTUA. Frequent visitor of Songshan Creative Park exhibitions.',
    photos: [
      'https://picsum.photos/seed/p3a/400/500',
      'https://picsum.photos/seed/p3b/400/500',
      'https://picsum.photos/seed/p3c/400/500',
    ],
    distance: 3.7,
    mutualFriendCount: 5,
    sharedEventCount: 3,
  },
  {
    userId: 'u-4',
    displayName: 'Leo',
    age: 29,
    gender: 'male',
    role: 'vers_top',
    bio: 'Chill vibes, living in Daan. Weekend hiker and occasional DJ at Ximending clubs.',
    photos: [
      'https://picsum.photos/seed/p4a/400/500',
      'https://picsum.photos/seed/p4b/400/500',
    ],
    distance: 0.8,
    mutualFriendCount: 2,
    sharedEventCount: 1,
  },
  {
    userId: 'u-5',
    displayName: 'Sam',
    age: 26,
    gender: 'non_binary',
    role: 'side',
    bio: 'Queer artist based in Taipei. Love live music, markets, and late-night ramen in Shilin.',
    photos: [
      'https://picsum.photos/seed/p5a/400/500',
      'https://picsum.photos/seed/p5b/400/500',
      'https://picsum.photos/seed/p5c/400/500',
    ],
    distance: 4.2,
    mutualFriendCount: 0,
    sharedEventCount: 2,
  },
  {
    userId: 'u-6',
    displayName: 'Danny',
    age: 33,
    gender: 'male',
    role: 'bottom',
    bio: 'Expat in Taipei for 3 years. Work in tech, party on weekends at OMNI and Triangle.',
    photos: [
      'https://picsum.photos/seed/p6a/400/500',
      'https://picsum.photos/seed/p6b/400/500',
    ],
    distance: 5.0,
    mutualFriendCount: 4,
    sharedEventCount: 0,
  },
  {
    userId: 'u-7',
    displayName: 'Riley',
    age: 22,
    gender: 'non_binary',
    role: 'vers_bottom',
    bio: 'NTU exchange student exploring Taipei one event at a time. Always down for boba.',
    photos: [
      'https://picsum.photos/seed/p7a/400/500',
      'https://picsum.photos/seed/p7b/400/500',
    ],
    distance: 1.5,
    mutualFriendCount: 1,
    sharedEventCount: 3,
  },
];

interface MockFriend {
  id: string;
  displayName: string;
  avatarUrl: string;
  status: 'accepted' | 'pending';
}

const MOCK_FRIENDS: MockFriend[] = [
  { id: 'f-1', displayName: 'Alice Chen', avatarUrl: 'https://picsum.photos/seed/f1/100/100', status: 'accepted' },
  { id: 'f-2', displayName: 'Bob Lin', avatarUrl: 'https://picsum.photos/seed/f2/100/100', status: 'accepted' },
  { id: 'f-3', displayName: 'Charlie Wang', avatarUrl: 'https://picsum.photos/seed/f3/100/100', status: 'accepted' },
  { id: 'f-4', displayName: 'Diana Huang', avatarUrl: 'https://picsum.photos/seed/f4/100/100', status: 'accepted' },
  { id: 'f-5', displayName: 'Ethan Wu', avatarUrl: 'https://picsum.photos/seed/f5/100/100', status: 'accepted' },
  { id: 'f-6', displayName: 'Faye Liu', avatarUrl: 'https://picsum.photos/seed/f6/100/100', status: 'pending' },
  { id: 'f-7', displayName: 'George Tsai', avatarUrl: 'https://picsum.photos/seed/f7/100/100', status: 'pending' },
];

const MOCK_ACTIVITY: FriendActivity[] = [
  {
    id: 'act-1',
    user: { id: 'f-1', displayName: 'Alice Chen', avatarUrl: 'https://picsum.photos/seed/f1/100/100' },
    type: 'attending',
    event: MOCK_EVENTS[0],
    createdAt: '2026-04-07T09:30:00+08:00',
  },
  {
    id: 'act-2',
    user: { id: 'f-2', displayName: 'Bob Lin', avatarUrl: 'https://picsum.photos/seed/f2/100/100' },
    type: 'interested',
    event: MOCK_EVENTS[1],
    createdAt: '2026-04-07T08:15:00+08:00',
  },
  {
    id: 'act-3',
    user: { id: 'f-3', displayName: 'Charlie Wang', avatarUrl: 'https://picsum.photos/seed/f3/100/100' },
    type: 'attending',
    event: MOCK_EVENTS[2],
    createdAt: '2026-04-06T22:00:00+08:00',
  },
  {
    id: 'act-4',
    user: { id: 'f-4', displayName: 'Diana Huang', avatarUrl: 'https://picsum.photos/seed/f4/100/100' },
    type: 'want_to_go',
    event: MOCK_EVENTS[3],
    createdAt: '2026-04-06T18:45:00+08:00',
  },
  {
    id: 'act-5',
    user: { id: 'f-1', displayName: 'Alice Chen', avatarUrl: 'https://picsum.photos/seed/f1/100/100' },
    type: 'attending',
    event: MOCK_EVENTS[3],
    createdAt: '2026-04-06T15:00:00+08:00',
  },
  {
    id: 'act-6',
    user: { id: 'f-5', displayName: 'Ethan Wu', avatarUrl: 'https://picsum.photos/seed/f5/100/100' },
    type: 'interested',
    event: MOCK_EVENTS[0],
    createdAt: '2026-04-06T12:30:00+08:00',
  },
  {
    id: 'act-7',
    user: { id: 'f-2', displayName: 'Bob Lin', avatarUrl: 'https://picsum.photos/seed/f2/100/100' },
    type: 'attending',
    event: MOCK_EVENTS[2],
    createdAt: '2026-04-06T10:00:00+08:00',
  },
  {
    id: 'act-8',
    user: { id: 'f-3', displayName: 'Charlie Wang', avatarUrl: 'https://picsum.photos/seed/f3/100/100' },
    type: 'want_to_go',
    event: MOCK_EVENTS[1],
    createdAt: '2026-04-05T20:00:00+08:00',
  },
  {
    id: 'act-9',
    user: { id: 'f-4', displayName: 'Diana Huang', avatarUrl: 'https://picsum.photos/seed/f4/100/100' },
    type: 'attending',
    event: MOCK_EVENTS[0],
    createdAt: '2026-04-05T16:30:00+08:00',
  },
  {
    id: 'act-10',
    user: { id: 'f-5', displayName: 'Ethan Wu', avatarUrl: 'https://picsum.photos/seed/f5/100/100' },
    type: 'interested',
    event: MOCK_EVENTS[3],
    createdAt: '2026-04-05T14:00:00+08:00',
  },
];

// ─── Hooks ──────────────────────────────────────────────────

export const useDiscoverPeople = (page: number) =>
  useQuery({
    queryKey: ['discover', 'people', page],
    queryFn: async (): Promise<DiscoverPerson[]> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_PEOPLE;
    },
  });

export const useFriends = () =>
  useQuery({
    queryKey: ['friends'],
    queryFn: async (): Promise<MockFriend[]> => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_FRIENDS;
    },
  });

export const useFriendActivity = () =>
  useQuery({
    queryKey: ['friends', 'activity'],
    queryFn: async (): Promise<FriendActivity[]> => {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_ACTIVITY;
    },
  });

// Re-export mock data for use in screens that need inline references
export { MOCK_EVENTS, MOCK_PEOPLE };
