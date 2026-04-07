// ============================================================
// FOMO App — Shared Constants
// ============================================================

export const APP_NAME = 'FOMO';
export const APP_TAGLINE = "Don't Miss Out!";
export const DEFAULT_TIMEZONE = 'Asia/Taipei';
export const DEFAULT_CURRENCY = 'TWD';

export const EVENT_CATEGORIES = [
  { key: 'nightclub', label: '夜店', emoji: '🪩' },
  { key: 'live_music', label: '演出', emoji: '🎵' },
  { key: 'market', label: '市集', emoji: '🛍️' },
  { key: 'sports', label: '運動', emoji: '🏃' },
  { key: 'exhibition', label: '展覽', emoji: '🎨' },
  { key: 'food_drink', label: '美食', emoji: '🍻' },
  { key: 'outdoor', label: '戶外', emoji: '⛰️' },
  { key: 'workshop', label: '工作坊', emoji: '🔧' },
  { key: 'party', label: '派對', emoji: '🎉' },
  { key: 'other', label: '其他', emoji: '✨' },
] as const;

export const DATE_FILTERS = [
  { key: 'today', label: '今天' },
  { key: 'this_weekend', label: '本週末' },
  { key: 'this_week', label: '本週' },
  { key: 'this_month', label: '本月' },
] as const;

export const SORT_OPTIONS = [
  { key: 'popularity', label: '最熱門' },
  { key: 'distance', label: '最近距離' },
  { key: 'date', label: '最新時間' },
  { key: 'price', label: '價格低到高' },
] as const;

// Ticket commission rate (platform cut)
export const PLATFORM_COMMISSION_RATE = 0.05; // 5%

// Promotion tiers
export const PROMOTION_TIERS = {
  standard: { price: 500, label: '標準曝光', durationDays: 7 },
  featured: { price: 1500, label: '精選推薦', durationDays: 7 },
  premium: { price: 3000, label: '首頁置頂', durationDays: 7 },
} as const;

// Uber deeplink template
export const UBER_DEEPLINK = 'uber://?action=setPickup&pickup=my_location&dropoff[latitude]={lat}&dropoff[longitude]={lng}&dropoff[nickname]={name}';
export const UBER_UNIVERSAL_LINK = 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]={lat}&dropoff[longitude]={lng}&dropoff[nickname]={name}';

// Google Maps deeplink
export const GOOGLE_MAPS_DEEPLINK = 'https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&destination_place_id={placeId}';

// Apple Maps deeplink
export const APPLE_MAPS_DEEPLINK = 'https://maps.apple.com/?daddr={lat},{lng}&dirflg=d';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Map defaults (Taipei)
export const DEFAULT_MAP_CENTER = {
  latitude: 25.033,
  longitude: 121.5654,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
