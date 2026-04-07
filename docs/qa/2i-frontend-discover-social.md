# QA Checklist — 2i Frontend Discover & Social

## Screens & Components

- [x] DiscoverScreen shows person cards with photos
  - FlatList of PersonCard components with large photo, name, age, RoleBadge
  - Filter button (top right) navigates to DatingFilterModal
  - Empty state with "Adjust Filters" CTA
  - Uses useDiscoverPeople hook with 7 mock people

- [x] PersonDetailScreen has photo carousel, bio, events, friend request button
  - Horizontal ScrollView photo carousel with pagination dots
  - Name, age, gender label, RoleBadge (md size)
  - About section with bio text
  - "Events in Common" section with 2 mock events
  - "Their Upcoming Events" section with 2 mock events
  - "Send Friend Request" sticky bottom button with disabled state after tap
  - Back button overlay on photos

- [x] DatingFilterModal has gender, role, age, distance filters
  - Gender multi-select (male, female, non_binary, other) as toggle chips
  - Role multi-select (top, bottom, vers, vers_top, vers_bottom, side, other)
  - Age range with two TextInputs (min/max, validated 18-99)
  - Max distance TextInput (1-50 km)
  - Apply button saves to datingFilterStore and navigates back
  - Reset button clears all filters
  - Cancel button to dismiss

- [x] FriendsListScreen has search, pending requests, friend list
  - Search bar filters accepted friends by name
  - Pending Requests section with Accept/Reject buttons (2 mock pending)
  - Friends list with avatars (5 mock accepted friends)
  - Pull to refresh
  - Empty state when no search results

- [x] FriendActivityScreen shows activity feed
  - FlatList of ActivityFeedItem components
  - Pull to refresh via onRefresh
  - 10 mock activity items with Taipei events
  - Empty state message

- [x] PersonCard component is reusable
  - Large photo (300px), name + age overlay with RoleBadge
  - Shared events count badge (top right)
  - Distance display, bio preview, mutual friends count
  - onPress callback prop

- [x] RoleBadge displays all 7 role types with colors
  - top=blue-500, bottom=red-500, vers=purple-500
  - vers_top=blue-400, vers_bottom=red-400, side=gray-400, other=gray-300
  - sm and md size variants
  - Uses useTranslation for labels

- [x] ActivityFeedItem component created
  - Avatar, "Name is attending Event Name" with bold text
  - Venue name and relative timestamp
  - Event thumbnail on right
  - onEventPress callback

- [x] datingFilterStore manages filter state
  - Zustand store with setGenders, setRoles, setAgeRange, setMaxDistance, reset
  - Default filters: empty arrays, age 18-99, distance 25km

- [x] All text uses useTranslation
  - All screens use `const { t } = useTranslation()` with fallback strings

- [x] Mock data uses realistic Taipei context
  - People: Yongkang Street, Xinyi District, Songshan Creative Park, Ximending, Shilin, NTU, OMNI, Triangle
  - Events: Ximending Neon Night, Taipei 101 Rooftop Party, Dadaocheng Market Walk, Songshan Creative Park Exhibition
  - Friends: Alice Chen, Bob Lin, Charlie Wang, Diana Huang, Ethan Wu (Taiwanese names)

## Navigation

- [x] DiscoverStack registered with Discover, PersonDetail, DatingFilter screens
- [x] ProfileStack updated with FriendsList and FriendActivity screens
- [x] MainTabs uses DiscoverStack (not standalone screen)

## Styling

- [x] NativeWind className used for ALL styling (no StyleSheet)
- [x] Consistent purple-600 brand color usage
- [x] SafeAreaView wrapping all screens
