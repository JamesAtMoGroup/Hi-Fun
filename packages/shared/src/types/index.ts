// ============================================================
// FOMO App — Shared Type Definitions
// ============================================================

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'merchant' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  eventsAttended: number;
  eventsWantToGo: number;
  friendCount: number;
}

// ─── Event ───────────────────────────────────────────────────
export type EventCategory =
  | 'nightclub'
  | 'live_music'
  | 'market'
  | 'sports'
  | 'exhibition'
  | 'food_drink'
  | 'outdoor'
  | 'workshop'
  | 'party'
  | 'other';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'ended';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;

  // Location
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;

  // Time
  startTime: string;   // ISO 8601
  endTime: string;
  timezone: string;     // e.g. 'Asia/Taipei'

  // Media
  coverImageUrl: string;
  imageUrls: string[];
  videoUrl?: string;    // YouTube link or direct
  youtubeAdUrl?: string;

  // Pricing / Tickets
  isFree: boolean;
  priceRange?: { min: number; max: number; currency: string };
  externalTicketUrl?: string;
  ticketTypes: TicketType[];

  // Popularity
  attendingCount: number;
  interestedCount: number;
  viewCount: number;

  // Relations
  organizerId: string;
  organizer?: Merchant;
  tags: string[];

  // Promotion
  isPromoted: boolean;
  promotionTier?: 'standard' | 'featured' | 'premium';

  createdAt: string;
  updatedAt: string;
}

export interface EventSummary {
  id: string;
  title: string;
  category: EventCategory;
  venueName: string;
  coverImageUrl: string;
  startTime: string;
  endTime: string;
  isFree: boolean;
  priceRange?: { min: number; max: number; currency: string };
  attendingCount: number;
  interestedCount: number;
  latitude: number;
  longitude: number;
  isPromoted: boolean;
  friendsGoing: FriendAttendance[];
}

export interface FriendAttendance {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: 'attending' | 'interested' | 'want_to_go';
}

// ─── Ticket ──────────────────────────────────────────────────
export interface TicketType {
  id: string;
  eventId: string;
  name: string;          // e.g. '早鳥票', 'VIP', '一般票'
  price: number;
  currency: string;      // 'TWD'
  quantity: number;
  soldCount: number;
  maxPerUser: number;
  saleStart: string;
  saleEnd: string;
  description?: string;
}

export interface Ticket {
  id: string;
  ticketTypeId: string;
  eventId: string;
  userId: string;
  orderId: string;
  qrCode: string;        // Dynamic QR payload (signed)
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  purchasedAt: string;
  usedAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'external';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

// ─── Merchant ────────────────────────────────────────────────
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'venue' | 'organizer' | 'brand';
  logoUrl?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  googleRating?: number;
  isVerified: boolean;
  createdAt: string;
}

export interface PromotionPackage {
  id: string;
  name: string;
  tier: 'standard' | 'featured' | 'premium';
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
}

// ─── Coupon ──────────────────────────────────────────────────
export interface Coupon {
  id: string;
  eventId?: string;
  merchantId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// ─── Social ──────────────────────────────────────────────────
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface EventInteraction {
  userId: string;
  eventId: string;
  type: 'attending' | 'interested' | 'want_to_go';
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: 'event_reminder' | 'friend_going' | 'hot_tonight' | 'ticket_confirmed' | 'promotion';
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ─── API ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Filters ─────────────────────────────────────────────────
export interface EventFilters {
  categories?: EventCategory[];
  dateRange?: 'today' | 'this_week' | 'this_weekend' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
  maxDistance?: number;   // km
  latitude?: number;
  longitude?: number;
  isFree?: boolean;
  search?: string;
  sortBy?: 'date' | 'distance' | 'popularity' | 'price';
}

// ─── Map ─────────────────────────────────────────────────────
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  category: EventCategory;
  attendingCount: number;
  isPromoted: boolean;
}
