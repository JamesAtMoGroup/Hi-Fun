# QA Checklist: 2b — DB Migrations

| # | Check | Status |
|---|-------|--------|
| 1 | All 15 tables from schema are covered (16 migration files including extensions) | PASSED |
| 2 | Migration order respects FK dependencies (users -> dating profiles/filters -> merchant_profiles -> venues -> events -> ticket_types -> orders -> order_items -> tickets -> event_interactions -> friendships -> coupons -> notifications -> promotion_placements) | PASSED |
| 3 | All UUID PKs use `gen_random_uuid()` via `knex.raw('gen_random_uuid()')` | PASSED |
| 4 | All timestamps use TIMESTAMPTZ (`{ useTz: true }`) with `.defaultTo(knex.fn.now())` | PASSED |
| 5 | PostGIS geography columns created correctly via `knex.raw('ALTER TABLE ... ADD COLUMN location GEOGRAPHY(Point, 4326) NOT NULL')` on venues and events | PASSED |
| 6 | All CHECK constraints present — role, locale, gender, dating_role, age, age_range, business_type, google_rating, category, status, promotion_tier, event_times, price_range, ticket price/quantity/sold/max_per_user, sale_window, sold_within_quantity, total_amount, payment_method, payment_status, order_items quantity/unit_price, ticket status, interaction type, friendship status, no_self_friendship, discount_type, discount_value, max_uses, used_count, coupon_window, used_within_max, notification type, promotion tier, price_paid, promotion_window | PASSED |
| 7 | All indexes present — spatial GIST (venues, events), GIN FTS (events), B-tree (events: start_time, popularity, category, organizer, promoted; ticket_types: event; orders: user, event; order_items: order; tickets: user, event, order; event_interactions: event; friendships: friend, accepted; coupons: code, merchant; notifications: user, unread; promotion_placements: active, event) | PASSED |
| 8 | Composite PK on event_interactions `table.primary(['user_id', 'event_id'])` | PASSED |
| 9 | orders.coupon_id added as nullable UUID in orders migration; FK to coupons.id added in coupons migration (000014) | PASSED |
| 10 | All `down()` functions properly drop tables (coupons down also drops FK from orders first) | PASSED |
| 11 | Dating tables have correct column types — `TEXT[]` via `specificType` for interested_in_genders, interested_in_roles, gender_filter, role_filter; `JSONB` for photos | PASSED |
