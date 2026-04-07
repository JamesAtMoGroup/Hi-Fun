# QA Checklist — Frontend Map & EventDetail

## MapScreen
- [x] MapScreen shows Google Map with markers (MapView with PROVIDER_GOOGLE, custom colored markers from useMapMarkers)
- [x] MapScreen has category filters and locate-me button (floating category chips at top, locate-me button bottom-right)

## EventDetailScreen
- [x] EventDetailScreen has all sections (cover image 250px, title+badge+date, interactions, friends, venue mini-map, description, tickets, organizer)
- [x] EventDetailScreen has sticky bottom CTA ("Buy Tickets — NT$XXX" or "Visit Ticket Site" for external URL)

## Components
- [x] InteractionButtons toggle active state with counts (Attending/Interested/Want to Go with increment/decrement logic)
- [x] TransportButtons build correct deeplink URLs (Uber + Navigate buttons using openTransport from deeplinks util)
- [x] TicketTypeCard has quantity selector (- / count / + with sold out state and max per user limit)
- [x] VenueMapPreview shows small map with pin (150px height, scrollEnabled=false, zoomEnabled=false, tap opens Google Maps)

## Utilities & Hooks
- [x] Deeplink utils use shared constants (buildUberDeeplink, buildGoogleMapsDeeplink, buildAppleMapsDeeplink, openTransport all use UBER_DEEPLINK, GOOGLE_MAPS_DEEPLINK, APPLE_MAPS_DEEPLINK from @fomo/shared)
- [x] All text uses useTranslation (all user-facing strings wrapped in t() calls)

## Files Delivered
| File | Status |
|------|--------|
| `apps/mobile/src/screens/map/MapScreen.tsx` | Replaced |
| `apps/mobile/src/screens/home/EventDetailScreen.tsx` | Replaced |
| `apps/mobile/src/components/InteractionButtons.tsx` | Already implemented |
| `apps/mobile/src/components/TransportButtons.tsx` | Already implemented |
| `apps/mobile/src/components/TicketTypeCard.tsx` | Already implemented |
| `apps/mobile/src/components/VenueMapPreview.tsx` | Already implemented |
| `apps/mobile/src/utils/deeplinks.ts` | Already implemented |
| `apps/mobile/src/hooks/useMapMarkers.ts` | Already implemented |
