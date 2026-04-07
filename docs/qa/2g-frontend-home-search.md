# QA Checklist: 2g Frontend Home & Search

## Checklist

- [x] HomeScreen has 4 sections (search, categories, hot tonight, nearby)
  - Also includes "Friends Are Going" section (5 sections total)
  - Search bar taps to navigate to SearchScreen
  - Category chips horizontal scroll from EVENT_CATEGORIES
  - Hot Tonight horizontal FlatList with EventCard (horizontal variant)
  - Nearby vertical FlatList with infinite scroll pagination via useNearbyEvents

- [x] SearchScreen has debounced search + results list
  - Auto-focus TextInput on mount (300ms delay)
  - 300ms debounce on search input
  - Filter button shows Alert placeholder
  - Active filter chips with removable UI
  - Results FlatList with EventListItem (compact row)
  - Empty state when no results with clear search CTA
  - Initial state with prompt message before searching

- [x] CategoryListScreen receives category param
  - Receives category from route.params
  - Shows emoji + category name in header
  - Filters events via useEvents with category filter
  - Empty state with go-back CTA

- [x] EventCard has both horizontal and vertical variants
  - horizontal: fixed width 288 (w-72), 144px image height
  - vertical: full width, 192px image height
  - Cover image, title, date/time, venue name
  - PriceTag (Free badge or NT$ range)
  - FriendAvatarStack when friends going
  - Promoted badge (amber) when isPromoted
  - onPress navigates to EventDetail

- [x] EventListItem is compact row layout
  - 64x64 thumbnail (h-16 w-16)
  - Title, date, venue in column
  - PriceTag on right side
  - onPress navigates to EventDetail

- [x] CategoryChips renders all 10 categories with emoji
  - Horizontal ScrollView
  - 10 categories from EVENT_CATEGORIES constant
  - Active state: purple background, white text
  - Inactive state: gray background, gray text
  - emoji + label per chip

- [x] PriceTag shows Free or price range
  - Free: green (emerald-500) badge
  - Price range: purple-100 bg, shows "NT$ min-max" or "NT$ price" if min===max

- [x] FriendAvatarStack shows overlapping avatars
  - Max 3 visible (configurable via maxVisible)
  - Overlapping with negative margin (30% overlap)
  - "+N" overflow indicator
  - Fallback initial letter for missing avatarUrl

- [x] All text uses useTranslation
  - HomeScreen: searchPlaceholder, hotTonight, friendsAreGoing, nearby
  - SearchScreen: placeholder, filters, filtersComingSoon, noResults, clearSearch, startSearching
  - CategoryListScreen: noEvents, goBack
  - EventCard: promoted, friendsGoing
  - PriceTag: free

- [x] NativeWind className used throughout
  - No StyleSheet.create in any component
  - All styling via className props
  - Inline styles only for dynamic values (avatar overlap margins)

## Notes
- Mock data: 10 Taipei events in useEvents.ts with variety of categories, prices, and friend attendance
- useEvents hook uses React Query (useQuery/useInfiniteQuery) with mock data fallback
- Navigation fully wired: Home -> Search, Home -> CategoryList, all cards -> EventDetail
