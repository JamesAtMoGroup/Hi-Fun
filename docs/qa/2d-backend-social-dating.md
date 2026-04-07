# QA Checklist: Backend Social & Dating API

## Social (Friends) Routes

- [x] All 7 friend routes implemented
  - GET /friends (listFriends) with search + pagination
  - POST /friends/requests (sendFriendRequest) with body validation
  - GET /friends/requests (listPendingRequests) with direction query param
  - PUT /friends/requests/:requestId/accept (acceptFriendRequest)
  - PUT /friends/requests/:requestId/reject (rejectFriendRequest)
  - DELETE /friends/:userId (removeFriend)
  - GET /friends/activity (friendActivity) with pagination

- [x] Friendship queries check both directions
  - listFriends: `(f.user_id = ? OR f.friend_id = ?)` with CASE for JOIN
  - sendFriendRequest: checks `(user_id, friend_id) OR (friend_id, user_id)` before insert
  - removeFriend: deletes where `(user_id, friend_id) OR (friend_id, user_id)` AND status=accepted
  - friendActivity: JOIN on `(f.user_id = ? AND f.friend_id = ei.user_id) OR (f.friend_id = ? AND f.user_id = ei.user_id)`

- [x] Friend activity shows only accepted friends' interactions
  - WHERE clause includes `f.status = 'accepted'` and `ei.user_id != ?` (excludes self)
  - Sorted by `ei.created_at DESC`
  - Returns FriendActivity shape: { id, user: { id, displayName, avatarUrl }, type, event: EventSummary, createdAt }

## Dating Routes

- [x] All 5 dating routes implemented
  - GET /users/me/dating-profile (getDatingProfile)
  - PUT /users/me/dating-profile (upsertDatingProfile) with body validation
  - GET /users/me/dating-filters (getDatingFilters)
  - PUT /users/me/dating-filters (updateDatingFilters) with body validation
  - GET /discover/people (discoverPeople) with query validation

- [x] Dating profile upsert works (create + update)
  - Checks for existing row, uses INSERT or UPDATE accordingly
  - Returns 201 for create, 200 for update
  - Stores JSON arrays for interestedInGenders, interestedInRoles, photos

- [x] Dating filters return defaults when not set
  - Defaults: `{ genders: [], roles: [], ageRange: { min: 18, max: 99 }, maxDistance: 50 }`
  - Returns stored values when present

- [x] Discover people filters by gender, role, age, distance
  - Gender: `dp.gender IN (?)` when user has gender filters set
  - Role: `dp.role IN (?)` when user has role filters set
  - Age: `dp.age >= ? AND dp.age <= ?`
  - Distance: Haversine formula with `<= maxDistance` when maxDistance > 0

- [x] Discover supports eventId filter
  - When eventId provided: `JOIN event_interactions ei_filter ON ei_filter.user_id = dp.user_id AND ei_filter.event_id = ?`

- [x] DiscoverPerson response excludes sensitive data
  - Only returns: userId, displayName, age, gender, role, bio, photos, distance, mutualFriendCount, sharedEventCount
  - Does NOT return: email, interestedInGenders, interestedInRoles, showOnDating, dating filters

- [x] Dating role values match: top/bottom/vers/vers_top/vers_bottom/side/other
  - Validator: `z.enum(['top', 'bottom', 'vers', 'vers_top', 'vers_bottom', 'side', 'other'])`

## Validators

- [x] Zod validators cover all inputs
  - `sendFriendRequestSchema`: userId (uuid, required)
  - `listPendingRequestsSchema`: direction (incoming|outgoing), page, pageSize
  - `listFriendsSchema`: search (optional), page, pageSize
  - `friendActivitySchema`: page, pageSize
  - `upsertDatingProfileSchema`: gender, role, interestedInGenders, interestedInRoles, bio (max 500), photos (max 6, url), showOnDating, age (18-120). Refine: photos >= 1 when showOnDating=true
  - `updateDatingFiltersSchema`: genders, roles, ageRange (min/max with min <= max), maxDistance (max 500)
  - `discoverPeopleSchema`: latitude (-90..90), longitude (-180..180), eventId (uuid, optional), page, pageSize

## Notes

- listPendingRequests uses string interpolation for column names (`myColumn`/`otherColumn`) but these are derived from a controlled ternary on the validated `direction` query param, so SQL injection is not possible.
- Query param validation is done via `validateQuery()` middleware (added to validate.ts).
- All routes use `requireAuth` middleware.
- Response format consistently uses `{ success: true, data: ... }` with paginated shape where applicable.
