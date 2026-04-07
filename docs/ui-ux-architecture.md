# FOMO App — UI/UX Architecture

## 1. Navigation Tree

```
RootNavigator (Stack)
│
├── AuthStack (shown when NOT authenticated)
│   ├── WelcomeScreen          — App intro, "Login" / "Register" buttons
│   ├── LoginScreen            — Email + password form
│   ├── RegisterScreen         — Email + password + display name
│   └── OnboardingDatingScreen — Optional dating profile setup (can skip)
│
├── MainTabs (shown when authenticated — 5 Bottom Tabs)
│   │
│   ├── 🏠 HomeTab (Stack)
│   │   ├── HomeScreen            — Event feed (trending, nearby, friends going)
│   │   ├── EventDetailScreen     — Full event details
│   │   ├── SearchScreen          — Search + filter events
│   │   ├── CategoryListScreen    — Events filtered by category
│   │   └── OrganizerProfileScreen — Merchant/organizer public page
│   │
│   ├── 🗺️ MapTab (Stack)
│   │   ├── MapScreen             — Full-screen Google Map with event markers
│   │   └── EventDetailScreen     — (reused) tapped from map marker
│   │
│   ├── 💜 DiscoverTab (Stack)
│   │   ├── DiscoverScreen        — Browse people (Tinder-like cards)
│   │   └── PersonDetailScreen    — View someone's profile + events attending
│   │
│   ├── 🎟️ TicketsTab (Stack)
│   │   ├── MyTicketsScreen       — Upcoming + past tickets
│   │   ├── TicketDetailScreen    — Ticket info + QR code
│   │   └── OrderHistoryScreen    — Past orders
│   │
│   └── 👤 ProfileTab (Stack)
│       ├── ProfileScreen           — My profile, stats, quick links
│       ├── EditProfileScreen       — Edit name, bio, avatar
│       ├── DatingProfileEditScreen — Edit dating profile (gender, role, bio, photos)
│       ├── DatingFilterScreen      — Set dating filter preferences
│       ├── MyEventsScreen          — My attending/interested/want_to_go events
│       ├── FriendsListScreen       — Friends list + pending requests
│       ├── FriendActivityScreen    — Feed of friend event interactions
│       ├── NotificationsScreen     — Notification center
│       └── SettingsScreen          — Language, push notifications, account
│
└── Modals (presented over MainTabs)
    ├── TicketPurchaseModal   — Select tickets → apply coupon → pay → confirmation
    ├── EventFilterModal      — Category, date range, distance, free/paid, sort
    ├── DatingFilterModal     — Gender, role, age range, distance filters
    └── TransportModal        — Choose Uber / Google Maps / Apple Maps
```

---

## 2. Screen Specifications

### 2.1 Auth Screens

#### WelcomeScreen
- **UI Sections**: App logo + tagline, hero illustration, "Login" button, "Register" button
- **API Calls**: None
- **Actions**: Navigate to LoginScreen or RegisterScreen
- **Nav Destinations**: LoginScreen, RegisterScreen

#### LoginScreen
- **UI Sections**: Email input, password input, "Login" button, "Forgot password?" link, back button
- **API Calls**: `POST /api/v1/auth/login`
- **Actions**: Submit login form → on success navigate to MainTabs
- **Nav Destinations**: MainTabs (on success), back to WelcomeScreen

#### RegisterScreen
- **UI Sections**: Display name input, email input, password input, confirm password, "Register" button
- **API Calls**: `POST /api/v1/auth/register`
- **Actions**: Submit register form → on success navigate to OnboardingDatingScreen
- **Nav Destinations**: OnboardingDatingScreen (on success), back to WelcomeScreen

#### OnboardingDatingScreen
- **UI Sections**: Step wizard (3 steps):
  1. Select your gender (male/female/non_binary/other) + dating role (top/bottom/vers/vers_top/vers_bottom/side/other)
  2. Select interested genders + interested roles (multi-select)
  3. Add dating bio + photos (optional)
  - "Skip" button on every step, "Done" button on last step
- **API Calls**: `PUT /api/v1/users/me/dating-profile`, `PUT /api/v1/users/me/dating-filters`
- **Actions**: Set up dating profile or skip entirely
- **Nav Destinations**: MainTabs

---

### 2.2 Home Tab

#### HomeScreen
- **UI Sections**:
  1. **Search bar** (tap → navigate to SearchScreen)
  2. **Category chips** (horizontal scroll — from `EVENT_CATEGORIES` constant)
  3. **Promoted events carousel** (hero cards, auto-scroll)
  4. **"Hot Tonight 🔥"** horizontal card row
  5. **"Friends Are Going"** horizontal card row (with friend avatar stack)
  6. **"Nearby Events"** vertical infinite scroll list
- **API Calls**:
  - `GET /api/v1/events/trending?limit=10` (hot tonight)
  - `GET /api/v1/events/nearby?lat=X&lng=Y&radiusKm=5` (nearby)
  - `GET /api/v1/events?sortBy=popularity&isPromoted=true` (promoted carousel)
  - `GET /api/v1/events?page=N` (infinite scroll)
- **Actions**: Tap event card → EventDetailScreen, tap category → CategoryListScreen, tap search bar → SearchScreen
- **Nav Destinations**: EventDetailScreen, SearchScreen, CategoryListScreen

#### EventDetailScreen
- **UI Sections**:
  1. **Cover image/video** (swipeable carousel)
  2. **Title, date/time, category badge**
  3. **Interaction buttons** (Attending / Interested / Want to Go)
  4. **"Friends Going"** avatar row (tap to see full list)
  5. **Venue info** with mini map preview (tap → open in Maps)
  6. **Description** (expandable)
  7. **Ticket types list** (name, price, availability)
  8. **"Buy Tickets" CTA button** (sticky bottom) or "Visit Ticket Site" for external
  9. **Transport buttons** (Uber / Navigate)
  10. **Organizer info card** (tap → OrganizerProfileScreen)
- **API Calls**:
  - `GET /api/v1/events/:id`
  - `GET /api/v1/events/:id/friends`
  - `GET /api/v1/events/:id/interact` (current user's interaction)
- **Actions**:
  - Toggle interaction → `POST /api/v1/events/:id/interact` or `DELETE`
  - Buy tickets → open TicketPurchaseModal (or external URL via in-app browser)
  - Navigate → open TransportModal
  - Share event (native share sheet)
- **Nav Destinations**: TicketPurchaseModal, TransportModal, OrganizerProfileScreen

#### SearchScreen
- **UI Sections**:
  1. **Search text input** (auto-focus, debounced)
  2. **Filter button** → opens EventFilterModal
  3. **Active filter chips** (removable)
  4. **Results list** (EventListItem — compact rows)
  5. **Empty state** when no results
- **API Calls**: `GET /api/v1/events?search=X&category=Y&dateRange=Z&...` (with `EventFilters`)
- **Actions**: Type to search, apply/remove filters, tap result → EventDetailScreen
- **Nav Destinations**: EventDetailScreen, EventFilterModal

#### CategoryListScreen
- **UI Sections**: Category header (emoji + name), filtered event list (vertical scroll)
- **API Calls**: `GET /api/v1/events?category=X`
- **Nav Destinations**: EventDetailScreen

#### OrganizerProfileScreen
- **UI Sections**: Logo, business name, description, Google rating, list of their events
- **API Calls**: `GET /api/v1/events?organizerId=X`
- **Nav Destinations**: EventDetailScreen

---

### 2.3 Map Tab

#### MapScreen
- **UI Sections**:
  1. **Full-screen Google Map** with custom markers (color-coded by category, size by popularity)
  2. **Category filter chips** (floating top bar)
  3. **"Locate me" button** (floating)
  4. **Bottom sheet** — appears on marker tap, shows EventCard preview, swipe up for list
  5. **Cluster markers** for dense areas (show count)
- **API Calls**:
  - `GET /api/v1/events/map-markers?lat=X&lng=Y&latDelta=D&lngDelta=D` (on region change, debounced 300ms)
  - `GET /api/v1/events/:id` (on marker tap, for bottom sheet)
- **Actions**: Pan/zoom map → reload markers, tap marker → show bottom sheet, tap bottom sheet → EventDetailScreen
- **Nav Destinations**: EventDetailScreen

---

### 2.4 Discover Tab (Dating)

#### DiscoverScreen
- **UI Sections**:
  1. **Filter button** (top right) → opens DatingFilterModal
  2. **Person cards** (vertical scroll or swipeable stack):
     - Photo (large), display name, age, dating role badge
     - "Events attending" section (small event cards this person is going to)
     - "Interested" / "Pass" buttons (or swipe left/right)
  3. **Empty state** when no matches ("Try adjusting your filters")
- **API Calls**: `GET /api/v1/discover/people?page=N`
- **Actions**: Swipe/tap on person → PersonDetailScreen, filter button → DatingFilterModal
- **Nav Destinations**: PersonDetailScreen, DatingFilterModal

#### PersonDetailScreen
- **UI Sections**:
  1. **Photos** (swipeable)
  2. **Name, age, gender, role badge**
  3. **Dating bio**
  4. **"Events in Common"** — events this person and you are both attending/interested in
  5. **"Their Upcoming Events"** — events they're attending
  6. **"Send Friend Request" button**
- **API Calls**: `GET /api/v1/discover/people` (person data from previous screen or cache)
- **Actions**: Send friend request → `POST /api/v1/friends/request`, tap event → EventDetailScreen
- **Nav Destinations**: EventDetailScreen, back

---

### 2.5 Tickets Tab

#### MyTicketsScreen
- **UI Sections**:
  1. **Segment control**: "Upcoming" / "Past"
  2. **Ticket cards** — event cover image, title, date, venue, "Show QR" button
  3. **Empty state** ("No tickets yet — explore events!")
- **API Calls**:
  - `GET /api/v1/tickets?status=valid` (upcoming)
  - `GET /api/v1/tickets?status=used` (past)
- **Actions**: Tap ticket → TicketDetailScreen, tap "Order History" → OrderHistoryScreen
- **Nav Destinations**: TicketDetailScreen, OrderHistoryScreen

#### TicketDetailScreen
- **UI Sections**:
  1. **Event info summary** (title, date, venue)
  2. **Large QR code** (refreshes every 30s for security)
  3. **Ticket info** (type name, price, purchase date)
  4. **"Navigate to venue" button** → TransportModal
  5. **Brightness auto-increase** (for scanning)
- **API Calls**: `GET /api/v1/tickets/:id/qr` (periodic refresh)
- **Nav Destinations**: TransportModal

#### OrderHistoryScreen
- **UI Sections**: List of past orders (date, event, total, payment status)
- **API Calls**: `GET /api/v1/orders`
- **Nav Destinations**: Order detail (inline expand)

---

### 2.6 Profile Tab

#### ProfileScreen
- **UI Sections**:
  1. **Profile header** (avatar, display name, bio)
  2. **Stats row**: Events Attended, Friends, Want to Go
  3. **Menu list**:
     - My Events (attending/interested/want_to_go)
     - Friends
     - Dating Profile
     - Dating Filters
     - Notifications
     - Settings
- **API Calls**: `GET /api/v1/users/me`
- **Nav Destinations**: All sub-screens listed above

#### EditProfileScreen
- **UI Sections**: Avatar picker (camera/gallery), display name input, bio textarea, save button
- **API Calls**: `PATCH /api/v1/users/me`

#### DatingProfileEditScreen
- **UI Sections**: Gender picker, role picker, dating bio textarea, photos grid (add/remove/reorder), "Show me on Discover" toggle
- **API Calls**: `GET /api/v1/users/me/dating-profile`, `PUT /api/v1/users/me/dating-profile`

#### DatingFilterScreen
- **UI Sections**: Gender multi-select, role multi-select, age range slider (18-65), max distance slider (1-50 km), save button
- **API Calls**: `GET /api/v1/users/me/dating-filters`, `PUT /api/v1/users/me/dating-filters`
- **Note**: Same filters accessible from DiscoverScreen's DatingFilterModal

#### MyEventsScreen
- **UI Sections**: Segment control (Attending / Interested / Want to Go / Past), event list
- **API Calls**: `GET /api/v1/users/me/events?type=attending|interested|want_to_go|past`

#### FriendsListScreen
- **UI Sections**: Search bar, friends list (avatar + name), pending requests section (accept/reject), "Add Friend" button
- **API Calls**: `GET /api/v1/friends`, `GET /api/v1/friends/pending`
- **Actions**: Accept → `POST /api/v1/friends/:id/accept`, reject → `DELETE /api/v1/friends/:id`

#### FriendActivityScreen
- **UI Sections**: Feed of "Alice is attending XYZ Event" items, pull to refresh
- **API Calls**: `GET /api/v1/friends/activity`
- **Nav Destinations**: EventDetailScreen (tap on event in feed)

#### NotificationsScreen
- **UI Sections**: Notification list (icon + title + body + time), "Mark all read" button, swipe-to-read
- **API Calls**: `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/read-all`

#### SettingsScreen
- **UI Sections**: Language selector (zh-TW / en), push notification toggle, account section (email, change password), logout button, delete account
- **API Calls**: `PUT /api/v1/notifications/push-token`

---

### 2.7 Modals

#### TicketPurchaseModal
- **Flow**: Select ticket types + quantities → Enter coupon code (optional) → Choose payment method → Order summary → Confirm → Success animation
- **API Calls**: `POST /api/v1/coupons/validate`, `POST /api/v1/orders`
- **Note**: For events with `externalTicketUrl`, tapping "Buy Tickets" opens URL in `WebBrowser.openBrowserAsync()` instead of this modal

#### EventFilterModal
- **UI Sections**: Category multi-select, date range picker (today/this_weekend/this_week/this_month), distance slider, free/paid toggle, sort by picker
- **Stores**: Updates `filterStore` → triggers React Query refetch

#### DatingFilterModal
- **UI Sections**: Same as DatingFilterScreen but in modal form (for quick access from DiscoverScreen)
- **API Calls**: `PUT /api/v1/users/me/dating-filters`

#### TransportModal
- **UI Sections**: Three buttons with icons:
  - 🚗 Uber — opens `uber://` deeplink (fallback to universal link)
  - 📍 Google Maps — opens Google Maps directions
  - 🗺️ Apple Maps — opens Apple Maps directions
- **API Calls**: None — purely client-side using deeplink templates from `@fomo/shared` constants
- **Logic**: Constructs URL from event's lat/lng/venue name using `UBER_DEEPLINK`, `GOOGLE_MAPS_DEEPLINK`, `APPLE_MAPS_DEEPLINK` templates

---

## 3. Shared Components

| Component | Description |
|-----------|-------------|
| `EventCard` | Card with cover image, title, date, venue, price tag, friend avatar stack, promoted badge. Horizontal (carousel) and vertical (list) variants. |
| `EventListItem` | Compact list row: small thumbnail, title, date, venue, price. For search results. |
| `PersonCard` | Dating card: large photo, name, age, role badge, events attending preview. |
| `FriendAvatarStack` | Row of overlapping circular avatars with "+N" overflow count. |
| `CategoryChips` | Horizontal scroll of category pills (emoji + label) from `EVENT_CATEGORIES`. |
| `InteractionButtons` | Three-button row: Attending / Interested / Want to Go. Active state styling. |
| `TransportButtons` | Uber + Navigate buttons (open TransportModal). |
| `PriceTag` | Shows "Free" badge or "NT$ min–max" range. |
| `TicketCard` | Ticket info card: event title, date, venue, QR button, status badge. |
| `TicketTypeCard` | Selectable ticket type row: name, price, remaining, quantity selector. |
| `QRCodeDisplay` | Renders QR code from signed payload, auto-refreshes, brightness control. |
| `MapMarkerCustom` | Custom map pin colored by category, sized by attendingCount. |
| `NotificationItem` | Notification row: type icon, title, body, timestamp, read/unread styling. |
| `ActivityFeedItem` | Friend activity row: avatar, "Name is attending Event", timestamp. |
| `ImageCarousel` | Swipeable image gallery with dots indicator. |
| `VenueMapPreview` | Small static map preview with pin, tap to open full map. |
| `SearchBar` | Styled text input with search icon, clear button, debounced onChange. |
| `FilterChip` | Removable pill showing active filter value. |
| `EmptyState` | Illustration + message + optional CTA button for empty lists. |
| `LoadingSpinner` | Consistent loading indicator (spinner or skeleton). |
| `RoleBadge` | Small colored badge showing dating role (Top/Bottom/Vers/etc). |
| `GenderIcon` | Icon representing gender selection. |
| `SegmentControl` | Tab-like switcher (e.g., Upcoming/Past, Attending/Interested). |
| `ProfileHeader` | Avatar + name + bio + stats row. Reused on Profile and PersonDetail. |
| `MenuListItem` | Settings-style row: icon, label, chevron, optional badge count. |
| `CouponInput` | Text input + "Apply" button for coupon codes. |
| `PaymentMethodPicker` | Select credit card / Apple Pay / Google Pay. |
| `OrderSummary` | Line items, coupon discount, total amount display. |
| `StickyBottomCTA` | Sticky bottom button bar (e.g., "Buy Tickets — NT$500"). |

---

## 4. Data Flow

### 4.1 Zustand Stores

| Store | State | Used By |
|-------|-------|---------|
| `authStore` | `{ user, accessToken, refreshToken, isAuthenticated, login(), logout(), register() }` | All screens (auth check), LoginScreen, RegisterScreen |
| `userStore` | `{ profile, datingProfile, datingFilters, updateProfile(), updateDatingProfile(), updateDatingFilters() }` | ProfileScreen, EditProfileScreen, DatingProfileEditScreen, DatingFilterScreen |
| `eventFilterStore` | `{ filters: EventFilters, setFilter(), resetFilters() }` | HomeScreen, SearchScreen, EventFilterModal |
| `datingFilterStore` | `{ filters: DatingFilters, setFilter(), resetFilters() }` | DiscoverScreen, DatingFilterModal, DatingFilterScreen |

### 4.2 React Query Hooks

| Hook | Query Key | API Call | Used By |
|------|-----------|----------|---------|
| `useEvents(filters)` | `['events', filters]` | `GET /events` | HomeScreen, SearchScreen, CategoryListScreen |
| `useTrendingEvents()` | `['events', 'trending']` | `GET /events/trending` | HomeScreen |
| `useNearbyEvents(lat, lng)` | `['events', 'nearby', lat, lng]` | `GET /events/nearby` | HomeScreen |
| `useMapMarkers(region)` | `['events', 'map', region]` | `GET /events/map-markers` | MapScreen |
| `useEvent(id)` | `['events', id]` | `GET /events/:id` | EventDetailScreen |
| `useEventFriends(id)` | `['events', id, 'friends']` | `GET /events/:id/friends` | EventDetailScreen |
| `useMyInteraction(eventId)` | `['interactions', eventId]` | `GET /events/:id/interact` | EventDetailScreen |
| `useDiscoverPeople(page)` | `['discover', 'people', page]` | `GET /discover/people` | DiscoverScreen |
| `useFriends()` | `['friends']` | `GET /friends` | FriendsListScreen |
| `usePendingFriends()` | `['friends', 'pending']` | `GET /friends/pending` | FriendsListScreen |
| `useFriendActivity()` | `['friends', 'activity']` | `GET /friends/activity` | FriendActivityScreen |
| `useMyTickets(status)` | `['tickets', status]` | `GET /tickets` | MyTicketsScreen |
| `useTicketQR(id)` | `['tickets', id, 'qr']` | `GET /tickets/:id/qr` | TicketDetailScreen |
| `useOrders()` | `['orders']` | `GET /orders` | OrderHistoryScreen |
| `useNotifications()` | `['notifications']` | `GET /notifications` | NotificationsScreen |
| `useMyProfile()` | `['users', 'me']` | `GET /users/me` | ProfileScreen |
| `useMyEvents(type)` | `['users', 'me', 'events', type]` | `GET /users/me/events` | MyEventsScreen |
| `useDatingProfile()` | `['users', 'me', 'dating-profile']` | `GET /users/me/dating-profile` | DatingProfileEditScreen |
| `useDatingFilters()` | `['users', 'me', 'dating-filters']` | `GET /users/me/dating-filters` | DatingFilterScreen, DatingFilterModal |

### 4.3 Mutations (React Query)

| Mutation | API Call | Used By |
|----------|----------|---------|
| `useSetInteraction()` | `POST /events/:id/interact` | EventDetailScreen |
| `useRemoveInteraction()` | `DELETE /events/:id/interact` | EventDetailScreen |
| `useCreateOrder()` | `POST /orders` | TicketPurchaseModal |
| `useValidateCoupon()` | `POST /coupons/validate` | TicketPurchaseModal |
| `useSendFriendRequest()` | `POST /friends/request` | PersonDetailScreen, FriendsListScreen |
| `useAcceptFriend()` | `POST /friends/:id/accept` | FriendsListScreen |
| `useRejectFriend()` | `DELETE /friends/:id` | FriendsListScreen |
| `useUpdateProfile()` | `PATCH /users/me` | EditProfileScreen |
| `useUpdateDatingProfile()` | `PUT /users/me/dating-profile` | DatingProfileEditScreen, OnboardingDatingScreen |
| `useUpdateDatingFilters()` | `PUT /users/me/dating-filters` | DatingFilterScreen, DatingFilterModal, OnboardingDatingScreen |
| `useMarkNotificationRead()` | `PATCH /notifications/:id/read` | NotificationsScreen |
| `useMarkAllRead()` | `POST /notifications/read-all` | NotificationsScreen |
| `useRegisterPushToken()` | `PUT /notifications/push-token` | App startup (automatic) |

---

## 5. Theming (NativeWind / Tailwind)

### Color Palette
```
Primary:      #7C3AED (purple-600) — main brand color
Secondary:    #EC4899 (pink-500) — dating/social accent
Background:   #FFFFFF (white)
Surface:      #F9FAFB (gray-50) — card backgrounds
Text Primary: #111827 (gray-900)
Text Sec:     #6B7280 (gray-500)
Success:      #10B981 (emerald-500)
Warning:      #F59E0B (amber-500)
Error:        #EF4444 (red-500)
```

### Typography
```
Heading 1:    24px bold (event title)
Heading 2:    20px semibold (section titles)
Body:         16px regular
Caption:      14px regular (secondary info)
Small:        12px regular (timestamps, badges)
```

### Spacing Scale
```
xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px
```
