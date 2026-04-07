# FOMO App MVP -- Final QA Report

**Date:** 2026-04-07
**QA Lead:** Cross-module final review

---

## 1. File Completeness Audit

### Backend (`server/`)

| Category | Expected | Found | Status |
|----------|----------|-------|--------|
| src/index.ts | 1 | 1 | PASS |
| src/config/ (database.ts, index.ts) | 2 | 2 | PASS |
| src/middleware/ (auth.ts, validate.ts, errorHandler.ts) | 3 | 3 | PASS |
| src/utils/ (jwt.ts, logger.ts) | 2 | 2 | PASS |
| src/routes/ (index, auth, events, social, dating, tickets, users, notifications, coupons) | 9 | 9 | PASS |
| src/controllers/ (auth, events, social, dating, tickets, users, notifications, coupons) | 8 | 8 | PASS |
| src/validators/ (auth, events, social, dating, tickets, users) | 6 | 6 | PASS |
| migrations/ (16 files) | 16 | 16 | PASS |
| knexfile.ts, package.json, tsconfig.json | 3 | 3 | PASS |

### Frontend (`apps/mobile/`)

| Category | Expected | Found | Status |
|----------|----------|-------|--------|
| Root files (App.tsx, app.json, package.json, tsconfig.json, tailwind.config.js, babel.config.js) | 6 | 6 | PASS |
| src/navigation/ (RootNavigator, AuthStack, MainTabs) | 3 | 3 | PASS |
| src/navigation/stacks/ (HomeStack, ProfileStack, TicketsStack, DiscoverStack) | 4 | 4 | PASS |
| src/screens/auth/ (Welcome, Login, Register, OnboardingDating) | 4 | 4 | PASS |
| src/screens/home/ (Home, EventDetail, Search, CategoryList) | 4 | 4 | PASS |
| src/screens/map/ (Map) | 1 | 1 | PASS |
| src/screens/discover/ (Discover, PersonDetail, DatingFilterModal) | 3 | 3 | PASS |
| src/screens/social/ (FriendsList, FriendActivity) | 2 | 2 | PASS |
| src/screens/profile/ (Profile, EditProfile, DatingProfileEdit, DatingFilter, MyEvents, Settings, Notifications) | 7 | 7 | PASS |
| src/screens/tickets/ (MyTickets, TicketDetail, OrderHistory) | 3 | 3 + 1 extra | PASS (note below) |
| src/components/ (17 components) | 17 | 17 | PASS |
| src/services/api.ts | 1 | 1 | PASS |
| src/stores/ (authStore, datingFilterStore) | 2 | 2 | PASS |
| src/hooks/ (useEvents, useDiscover, useMapMarkers) | 3 | 3 | PASS |
| src/utils/deeplinks.ts | 1 | 1 | PASS |
| src/i18n/ (index.ts, locales/zh-TW.json, locales/en.json) | 3 | 3 | PASS |
| src/theme/index.ts | 1 | 1 | PASS |

### Shared (`packages/shared/`)

| Category | Expected | Found | Status |
|----------|----------|-------|--------|
| src/types/index.ts | 1 | 1 | PASS |
| src/constants/index.ts | 1 | 1 | PASS |

**Notes:**
- `apps/mobile/src/screens/tickets/TicketsScreen.tsx` is an extra placeholder file (11 lines, basic View+Text) that is not imported by any navigation stack. It can be safely deleted. The actual tickets screens are `MyTicketsScreen.tsx`, `TicketDetailScreen.tsx`, and `OrderHistoryScreen.tsx`.

---

## 2. Cross-Module Consistency

### 2.1 API Route Paths vs Frontend

| Backend Route | Frontend Usage | Status |
|---------------|---------------|--------|
| POST /auth/register | api.ts base URL + hooks | PASS |
| POST /auth/login | api.ts base URL + hooks | PASS |
| POST /auth/refresh | api.ts interceptor calls `${BASE_URL}/auth/refresh` | PASS |
| GET /auth/me | via api interceptor pattern | PASS |
| GET /events, /events/trending, /events/nearby, /events/map-markers | useEvents.ts hooks | PASS |
| GET /events/:eventId | EventDetailScreen via useEvents | PASS |
| GET /discover/people | useDiscover.ts hook | PASS |
| GET,PUT /users/me/dating-profile | Dating profile screens | PASS |
| GET,PUT /users/me/dating-filters | Dating filter screens + store | PASS |
| GET /friends, POST /friends/requests | Social screens | PASS |
| POST /orders, GET /tickets | Ticket screens | PASS |
| GET /notifications | NotificationsScreen | PASS |

The frontend api.ts client is configured with `BASE_URL = /api/v1` and all hooks construct paths that align with the backend route structure.

### 2.2 Shared Types Coverage

The shared `types/index.ts` defines all major data shapes used across both server and frontend:
- User, UserProfile, Event, EventSummary, TicketType, Ticket, Order, OrderItem
- DatingProfile, DatingFilters, DiscoverPerson
- FriendActivity, Friendship, EventInteraction
- Notification, Coupon, Merchant
- ApiResponse, PaginatedResponse, EventFilters, MapMarker
- Gender, DatingRole, EventCategory, EventStatus

**Status:** PASS -- comprehensive coverage.

### 2.3 Dating Role Values

| Location | Values | Status |
|----------|--------|--------|
| shared/types (`DatingRole`) | top, bottom, vers, vers_top, vers_bottom, side, other | PASS |
| dating.validator.ts (`datingRoleValues`) | top, bottom, vers, vers_top, vers_bottom, side, other | PASS |
| DatingFilterModal.tsx (role toggle chips) | top, bottom, vers, vers_top, vers_bottom, side, other | PASS |
| i18n zh-TW.json / en.json (dating section) | top, bottom, vers, versTop, versBottom, side keys | PASS |
| RoleBadge component | top, bottom, vers, vers_top, vers_bottom, side, other | PASS |
| DB migration CHECK constraint | top, bottom, vers, vers_top, vers_bottom, side, other | PASS |

**Status:** PASS -- consistent across all layers.

### 2.4 Gender Values

| Location | Values | Status |
|----------|--------|--------|
| shared/types (`Gender`) | male, female, non_binary, other | PASS |
| dating.validator.ts (`genderValues`) | male, female, non_binary, other | PASS |
| i18n locales (dating section) | male, female, nonBinary, other keys | PASS |
| DB migration CHECK constraint | male, female, non_binary, other | PASS |

**Status:** PASS -- consistent across all layers.

### 2.5 Event Category Values

| Location | Values | Status |
|----------|--------|--------|
| shared/types (`EventCategory`) | nightclub, live_music, market, sports, exhibition, food_drink, outdoor, workshop, party, other | PASS |
| shared/constants (`EVENT_CATEGORIES`) | Same 10 values with labels/emoji | PASS |
| events.validator.ts | Same 10 values | PASS |
| i18n locales (categories section) | Same 10 keys | PASS |
| DB migration CHECK constraint | Same 10 values | PASS |

**Status:** PASS -- consistent across all layers.

### 2.6 Navigation Stack -> Screen Mapping

| Stack | Registered Screens | Screen Files Exist | Status |
|-------|-------------------|-------------------|--------|
| AuthStack | Welcome, Login, Register, OnboardingDating | All 4 exist | PASS |
| HomeStack | Home, EventDetail, Search, CategoryList | All 4 exist | PASS |
| DiscoverStack | Discover, PersonDetail, DatingFilter(Modal) | All 3 exist | PASS |
| ProfileStack | Profile, EditProfile, DatingProfileEdit, DatingFilter, MyEvents, FriendsList, FriendActivity, Notifications, Settings | All 9 exist | PASS |
| TicketsStack | MyTickets, TicketDetail, OrderHistory | All 3 exist | PASS |
| MainTabs | HomeTab, MapTab, DiscoverTab, TicketsTab, ProfileTab | All 5 reference valid components | PASS |

**Status:** PASS -- all navigation references resolve to existing screen files.

---

## 3. Security Findings

### 3.1 Auth Middleware Application

| Route Group | Auth Type | Status |
|-------------|-----------|--------|
| POST /auth/register, /auth/login, /auth/refresh | None (public) | PASS (correct) |
| GET /auth/me | requireAuth | PASS |
| GET /events, /events/trending, /events/nearby, /events/map-markers, /events/:eventId | optionalAuth | PASS (allows unauthenticated browsing with friends data for authenticated users) |
| GET /events/:eventId/friends-going | requireAuth | PASS |
| POST/DELETE /events/:eventId/interactions | requireAuth | PASS |
| All /friends/* routes | requireAuth | PASS |
| All /users/me/* and dating routes | requireAuth | PASS |
| GET /users/:userId (public profile) | requireAuth | PASS |
| All /orders/* and /tickets/* routes | requireAuth | PASS |
| POST /tickets/validate | requireAuth + merchant/admin role check in controller | PASS |
| All /notifications/* routes | requireAuth | PASS |
| POST /coupons/validate | requireAuth | PASS |

**Status:** PASS -- all protected routes have proper auth middleware.

### 3.2 Sensitive Data Exposure

| Check | Status | Details |
|-------|--------|---------|
| password_hash excluded from API responses | PASS | `formatUser()` in auth.controller selects specific fields, excludes password_hash |
| Public profile excludes email | PASS | `formatPublicProfile()` in users.controller omits email |
| Discover endpoint excludes sensitive dating data | PASS | `discoverPeople` response only includes: userId, displayName, age, gender, role, bio, photos, distance, mutualFriendCount, sharedEventCount. Comment explicitly states: "NEVER expose sensitive data (email, filters, interestedIn)" |
| Other users' dating filters not leaked | PASS | GET /users/me/dating-filters only returns the authenticated user's own filters |
| Ticket ownership enforced | PASS | getTicket and getQR check `ticket.user_id !== userId` and throw 403 |
| Order ownership enforced | PASS | getOrder checks `order.user_id !== userId` and throws 403 |

**Status:** PASS -- no sensitive data leaks identified.

### 3.3 SQL Injection Prevention

| Check | Status | Details |
|-------|--------|---------|
| Knex query builder used (auto-parameterized) | PASS | All standard queries use `.where()`, `.whereIn()`, etc. |
| Raw SQL uses parameterized placeholders | PASS | `discoverPeople` in dating.controller builds raw SQL with `?` placeholders and ordered parameter array |
| Full-text search parameterized | PASS | `plainto_tsquery('simple', ?)` with bound parameter |
| PostGIS queries parameterized | PASS | `ST_DWithin(e.location, ST_MakePoint(?, ?)::geography, ?)` with bound values |
| No string concatenation in queries | PASS | Social controller uses controlled ternary for column names (not user input) |

**Status:** PASS -- all queries use parameterized values.

### 3.4 JWT Verification

| Check | Status | Details |
|-------|--------|---------|
| Access token verification | PASS | `jwt.verify(token, config.jwtSecret)` in verifyAccessToken |
| Refresh token verification | PASS | `jwt.verify(token, config.jwtRefreshSecret)` with separate secret |
| Refresh token invalidation | PASS | Old refresh token deleted from DB before issuing new one (rotation) |
| Refresh token stored in DB | PASS | Checked against DB in refresh endpoint |
| QR code JWT with 30s expiry | PASS | `jwt.sign({...}, secret, { expiresIn: '30s' })` with separate verify + TokenExpiredError handling |

**Status:** PASS -- JWT implementation is secure.

### 3.5 Security Issue Found

| Issue | Severity | Details |
|-------|----------|---------|
| Missing `refresh_tokens` migration | HIGH | `auth.controller.ts` reads/writes to a `refresh_tokens` table (lines 59, 101, 130-141, 152-158) but no migration creates this table. The app will fail at runtime when users attempt to register, login, or refresh tokens. |

---

## 4. i18n Coverage

### Key Structure Comparison

Both `zh-TW.json` and `en.json` have identical key structures:

| Section | zh-TW Keys | en Keys | Match |
|---------|-----------|---------|-------|
| tabs (5 keys) | 5 | 5 | PASS |
| auth (9 keys) | 9 | 9 | PASS |
| events (14 keys) | 14 | 14 | PASS |
| dating (22 keys) | 22 | 22 | PASS |
| common (13 keys) | 13 | 13 | PASS |
| map (2 keys) | 2 | 2 | PASS |
| eventDetail (12 keys) | 12 | 12 | PASS |
| interaction (3 keys) | 3 | 3 | PASS |
| categories (10 keys) | 10 | 10 | PASS |
| profile (14 keys) | 14 | 14 | PASS |
| settings (12 keys) | 12 | 12 | PASS |
| notifications (3 keys) | 3 | 3 | PASS |
| tickets (18 keys) | 18 | 18 | PASS |

**Status:** PASS -- both locale files have identical key structures with 137 translation keys each.

---

## 5. Individual Agent QA Summaries

### 2a -- Backend Foundation
All 10 checks passed. Express app properly configured with helmet, CORS, rate limiting, error handler. Config reads all env vars with sensible defaults. Health check endpoint functional.

### 2b -- DB Migrations
All 11 checks passed. 16 migration files covering all 15 tables plus extensions. FK dependencies, UUID PKs, timestamps, PostGIS geography, CHECK constraints, indexes, and composite PKs all correctly implemented.

### 2c -- Backend Events API
All 10 checks passed. 8 event routes with proper auth, validation, PostGIS spatial queries, full-text search, pagination, friends-going population, view count increment, atomic interaction updates, and parameterized SQL.

### 2d -- Backend Social & Dating API
All checks passed. 7 friend routes and 5 dating routes with bidirectional friendship queries, dating profile upsert, default filters, discover filtering by gender/role/age/distance, event-scoped filtering, and sensitive data exclusion.

### 2e -- Backend Tickets/Orders/Notifications
All 10 checks passed. Auth with bcrypt, transactional order creation with ticket generation, signed QR codes (30s expiry), QR validation with status checks, computed user profile fields, full notification CRUD, and coupon validation.

### 2f -- Frontend Foundation
12/12 checks passed. All providers, navigation, API client with token refresh, auth store with secure storage, i18n config, theme, and Tailwind config all properly set up.

### 2g -- Frontend Home & Search
All 10 checks passed. HomeScreen with 5 sections, debounced search, category filtering, dual EventCard variants, compact EventListItem, CategoryChips, PriceTag, FriendAvatarStack, NativeWind styling, and translations.

### 2h -- Frontend Map & EventDetail
All checks passed. MapScreen with Google Maps + markers + category filters + locate-me. EventDetailScreen with all sections, sticky buy CTA, interaction buttons, transport deeplinks, ticket type cards, venue map preview.

### 2i -- Frontend Discover & Social
All checks passed. DiscoverScreen with PersonCard grid, PersonDetailScreen with photo carousel + friend request, DatingFilterModal with all filter types, FriendsListScreen with search/pending/accepted, FriendActivityScreen with feed, all supporting components, and datingFilterStore.

### 2j -- Frontend Profile & Tickets
All 13 checks passed. ProfileScreen with header/stats/menu, EditProfile, DatingProfileEdit, DatingFilter, MyEvents with segments, Settings with language/logout/delete, NotificationsScreen, MyTickets with segments, TicketDetail with QR, OrderHistory.

---

## 6. Overall MVP Readiness Assessment

### Verdict: CONDITIONALLY READY

The FOMO app MVP is **nearly complete** with one blocking issue that must be resolved before deployment:

**Blocking:**
1. **Missing `refresh_tokens` table migration** -- The auth controller references a `refresh_tokens` table that does not exist in any migration. This will cause runtime errors on register, login, and token refresh. A new migration file (e.g., `20260407000017_create_refresh_tokens.ts`) must be created.

**Non-blocking (can ship, but should be tracked):**
- All 100+ files are present and properly structured
- All cross-module types, enums, and constants are consistent
- Security posture is solid (auth, data exposure, SQL injection, JWT)
- i18n is complete with matching key structures
- Navigation is fully wired with all screens reachable
- All individual agent QA reports show 100% pass rates

---

## 7. Known Issues / Tech Debt for Future

| # | Item | Severity | Category |
|---|------|----------|----------|
| 1 | **Missing `refresh_tokens` migration** | BLOCKING | Backend/DB |
| 2 | Placeholder `TicketsScreen.tsx` (unused, 11 lines) should be deleted | LOW | Cleanup |
| 3 | Tab bar icons return `undefined as any` -- need actual icon library integration (e.g., `@expo/vector-icons`) | MEDIUM | Frontend/UX |
| 4 | Frontend hooks (useEvents, useDiscover, useMapMarkers) currently use mock data with fallback to API -- production should remove mock data | MEDIUM | Frontend |
| 5 | Password change and photo picker features show "coming soon" alerts | LOW | Feature gap |
| 6 | No rate limiting on auth endpoints specifically (general rate limit exists) -- consider stricter per-route limits for login/register | LOW | Security |
| 7 | `createOrder` sets `payment_status: 'paid'` immediately without actual payment gateway integration | MEDIUM | Business logic |
| 8 | No email verification flow on registration | LOW | Feature gap |
| 9 | No password reset flow | LOW | Feature gap |
| 10 | Coupon `event_id` scoping check could be tightened (currently optional field) | LOW | Business logic |
| 11 | Platform commission (5%) is added to customer total rather than deducted from merchant payout -- verify this matches business intent | LOW | Business logic |
| 12 | `discoverPeople` raw SQL is complex -- consider breaking into Knex builder for maintainability | LOW | Tech debt |
