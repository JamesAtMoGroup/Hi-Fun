# UI/UX Architect — QA Checklist

## Self-Verification Results

### 1. ✅ PASSED — Every screen has at least one API endpoint mapped
- **Verification**: Reviewed all 25+ screens. Each has API calls documented.
- **Exceptions**: WelcomeScreen (no API needed — static), TransportModal (client-side deeplinks only). These are correct exceptions.

### 2. ✅ PASSED — Navigation has no dead ends
- **Verification**: Every screen has a back button or nav destination. Auth flow leads to MainTabs. All stack screens can return to parent tab. Modals can be dismissed.
- **Flow check**:
  - Welcome → Login → MainTabs ✓
  - Welcome → Register → OnboardingDating → MainTabs ✓
  - HomeScreen → EventDetail → TicketPurchaseModal → back ✓
  - DiscoverScreen → PersonDetail → EventDetail → back ✓
  - All Profile sub-screens → back to ProfileScreen ✓

### 3. ✅ PASSED — All main user journeys covered
- **Browse → Detail → Buy → Navigate**: HomeScreen → EventDetailScreen → TicketPurchaseModal → TransportModal ✓
- **Search → Filter → Detail**: SearchScreen → EventFilterModal → EventDetailScreen ✓
- **Map → Detail**: MapScreen → marker tap → bottom sheet → EventDetailScreen ✓
- **Dating Discover → Filter → Person**: DiscoverScreen → DatingFilterModal → PersonDetailScreen ✓
- **Social → Friends**: ProfileScreen → FriendsListScreen → accept/reject ✓
- **Friend Activity → Event**: FriendActivityScreen → EventDetailScreen ✓
- **Tickets → QR**: MyTicketsScreen → TicketDetailScreen (QR display) ✓

### 4. ✅ PASSED — 5 tabs: Home, Map, Discover, Tickets, Profile
- **Verification**: MainTabs has exactly 5 bottom tabs:
  1. 🏠 Home (event feed)
  2. 🗺️ Map (event map)
  3. 💜 Discover (dating browse)
  4. 🎟️ Tickets (my tickets)
  5. 👤 Profile (settings & profile)

### 5. ✅ PASSED — Auth flow includes optional dating onboarding
- **Verification**: Register → OnboardingDatingScreen (3-step wizard with "Skip" on every step). Users can skip entirely and set up later in Profile → DatingProfileEditScreen.

### 6. ✅ PASSED — Dating filters accessible from Discover tab AND Profile settings
- **Verification**:
  - DiscoverScreen → DatingFilterModal (quick access) ✓
  - ProfileScreen → DatingFilterScreen (full settings page) ✓
  - Both call `PUT /api/v1/users/me/dating-filters` and update `datingFilterStore`

### 7. ✅ PASSED — i18n accounted for
- **Verification**: SettingsScreen includes language selector (zh-TW / en). All user-facing strings should go through `t()` translation function. System locale detection on first launch.
- **Note for devs**: Use `i18next` with `react-i18next`. Translation files at `apps/mobile/src/i18n/locales/{zh-TW,en}.json`.

### 8. ✅ PASSED — Eventbrite-style card layout described
- **Verification**: EventCard component described with cover image, title, date, venue, price tag, friend avatar stack. Two variants: horizontal (carousel) and vertical (list). Clean card-based feed on HomeScreen with sections.

### 9. ✅ PASSED — Every user-facing shared type has UI representation
- **Types checked**:
  - `Event` / `EventSummary` → EventCard, EventListItem, EventDetailScreen ✓
  - `User` / `UserProfile` → ProfileScreen, ProfileHeader ✓
  - `Ticket` → TicketCard, TicketDetailScreen ✓
  - `TicketType` → TicketTypeCard ✓
  - `Order` / `OrderItem` → OrderHistoryScreen, OrderSummary ✓
  - `Friendship` → FriendsListScreen ✓
  - `EventInteraction` → InteractionButtons ✓
  - `Notification` → NotificationItem ✓
  - `MapMarker` → MapMarkerCustom ✓
  - `FriendAttendance` → FriendAvatarStack ✓
  - `Coupon` → CouponInput (validate flow) ✓
  - `EventFilters` → EventFilterModal ✓
  - `DatingProfile` (new) → PersonCard, DatingProfileEditScreen ✓
  - `DatingFilters` (new) → DatingFilterModal, DatingFilterScreen ✓
  - `Merchant` → OrganizerProfileScreen ✓

### 10. ✅ PASSED — All modals documented
- **Modals**: TicketPurchaseModal, EventFilterModal, DatingFilterModal, TransportModal
- Each has UI sections, API calls, and flow documented.

### 11. ✅ PASSED — Component list covers all reusable UI pieces
- **Verification**: 28 shared components documented with descriptions.
- **Coverage**: Event display (3), Dating (3), Social (2), Tickets (3), Map (2), Navigation/Layout (4), Forms/Input (4), Feedback (3), Profile (2), Commerce (3).

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | API endpoint mapping | ✅ PASSED |
| 2 | No dead-end navigation | ✅ PASSED |
| 3 | All user journeys | ✅ PASSED |
| 4 | 5 tabs | ✅ PASSED |
| 5 | Dating onboarding | ✅ PASSED |
| 6 | Dating filters dual access | ✅ PASSED |
| 7 | i18n support | ✅ PASSED |
| 8 | Eventbrite card style | ✅ PASSED |
| 9 | Type → UI mapping | ✅ PASSED |
| 10 | Modals documented | ✅ PASSED |
| 11 | Component coverage | ✅ PASSED |

**Result: 11/11 PASSED**
