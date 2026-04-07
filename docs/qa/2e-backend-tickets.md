# QA Checklist: Backend Tickets/Orders/Notifications

## Results

- [x] Auth routes (register, login, refresh, me) implemented
  - `server/src/routes/auth.ts` — 4 routes mounted
  - `server/src/controllers/auth.controller.ts` — full implementation with proper error codes

- [x] Password hashing with bcryptjs
  - `auth.controller.ts` uses `bcrypt.genSalt(10)` + `bcrypt.hash()` on register
  - `bcrypt.compare()` on login

- [x] Order creation in transaction with ticket generation
  - `tickets.controller.ts` `createOrder` uses `db.transaction()` to insert order, order_items, and individual tickets atomically
  - Validates ticket availability, sale window, max per user
  - Updates `ticket_types.sold_count` within transaction
  - Applies coupon discount if provided

- [x] QR code generation uses signed JWT (30s expiry)
  - `getQR` generates `jwt.sign({ ticketId, userId, ts }, secret, { expiresIn: '30s' })`
  - Returns `{ qrPayload, expiresAt }` response

- [x] QR validation checks signature, expiry, ticket status
  - `validateQR` calls `jwt.verify()` — catches `TokenExpiredError` separately
  - Checks ticket exists, status is 'valid' (not used/cancelled/refunded)
  - Marks ticket as 'used' with `used_at` timestamp
  - Requires merchant or admin role

- [x] UserProfile computed fields (eventsAttended, friendCount)
  - `users.controller.ts` `getComputedFields()` counts from `event_interactions` and `friendships`
  - Returns `eventsAttended`, `eventsWantToGo`, `friendCount`
  - Public profile excludes email and sensitive data

- [x] Notifications CRUD complete
  - `GET /notifications` — paginated list
  - `PUT /notifications/:notificationId/read` — mark single read
  - `PUT /notifications/read-all` — mark all read
  - `POST /notifications/push-tokens` — register expo push token (upsert)
  - `DELETE /notifications/push-tokens` — unregister push token

- [x] Coupon validation logic correct
  - Checks: code exists, `is_active`, not expired (`valid_from`/`valid_until`), not maxed (`used_count < max_uses`), applicable to `eventId`
  - Returns discount details on success

- [x] All routes mounted in index.ts
  - `routes/index.ts` mounts: auth, events, social, dating, tickets, users, notifications, coupons

- [x] All validators use Zod
  - `auth.validator.ts` — registerSchema, loginSchema, refreshSchema
  - `tickets.validator.ts` — createOrderSchema, listTicketsSchema, validateQRSchema
  - `users.validator.ts` — updateProfileSchema, getMyEventsSchema
  - All use structured `{ body, query }` pattern compatible with `validate()` middleware
